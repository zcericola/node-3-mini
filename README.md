<img src="https://devmounta.in/img/logowhiteblue.png" width="250" align="right">

# Project Summary

In this project, we will take the afternoon project of the first day of Node and modify it to use `sessions`, custom `middleware`, and also use `query parameters`. We'll build a filter middleware that will censor words before being pushed to the `messages` array. We'll also modify the `update` and `delete` endpoints to use `query parameters` instead of URL parameters. Lastly, we'll use `sessions` to keep track of messages sent by a user during a session and build out an endpoint that will display the history of messages.

<img src="https://github.com/DevMountain/node-chat-sessions/blob/solution/readme-assets/1-1.png" />

## Setup

* Fork and clone this repository.
* `cd` into the project.
* Run `npm install`.

## Step 1

### Summary

In this step, we'll use `npm` to install `express-session`, require it in our `server/index.js`, and configure our app to use `sessions`.

### Instructions

* Run `npm install --save express-session`.
* Open `server/index.js` and require `express-session` in a variable called `session`.
* Configure the app to use sessions using `app.use`.
  * The first parameter should be `session` invoked with an object as its first argument.
  * In the object define the value for `secret`, `resave`, `saveUninitialized`, and `cookie.maxAge`.

### Solution

<details>

<summary> <code> server/index.js </code> </summary>

```js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mc = require( `${__dirname}/controllers/messages_controller` );

const app = express();

app.use( bodyParser.json() );
app.use( express.static( `${__dirname}/../public/build` ) );
app.use( session({
  secret: '@nyth!ng y0u w@nT',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 10000 }
}));

const messagesBaseUrl = "/api/messages";
app.post( messagesBaseUrl, mc.create );
app.get( messagesBaseUrl, mc.read );
app.put( `${messagesBaseUrl}`, mc.update );
app.delete( `${messagesBaseUrl}`, mc.delete );

const port = 3000;
app.listen( port, () => { console.log(`Server listening on port ${port}.`); } );
```

</details>

## Step 2

### Summary

In this step, we'll create custom middleware that will check to see if the session has a `user` object. If it doesn't, we'll add a user object that has a `messages` array on it.

### Instructions

* Create a folder called `middlewares` in `server/`.
* Create a file called `session` in `server/middlewares/session.js`.
* Open `server/middlewares/session.js`.
* Use `module.exports` to export a function with a `req`, `res`, and `next` parameter.
* Inside the function check if `req.session` has a user property, if it doesn't add a user property that equals an object with a `messages` array on it.
* After the if statement, call `next`.
* Open `server/index.js`.
* Require `server/middlewares/session.js` in a variable called `createInitialSession`.
* Add middleware to `app` that captures `req`, `res`, and `next` and then calls `createInitialSession` with `req`, `res`, and `next` as arguments.

### Solution

<details>

<summary> <code> server/middlewares/session.js </code> </summary>

```js
module.exports = function( req, res, next ) {
  const { session, method } = req;
  if ( !session.user ) {
    session.user = {
      messages: []
    };
  }

  next();
}
```

</details>

<details>

<summary> <code> server/index.js </code> </summary>

```js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mc = require( `${__dirname}/controllers/messages_controller` );

const createInitialSession = require( `${__dirname}/middlewares/session.js` );

const app = express();

app.use( bodyParser.json() );
app.use( express.static( `${__dirname}/../public/build` ) );
app.use( session({
  secret: '@nyth!ng y0u w@nT',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 10000 }
}));

app.use( ( req, res, next ) => createInitialSession( req, res, next ) );

const messagesBaseUrl = "/api/messages";
app.post( messagesBaseUrl, mc.create );
app.get( messagesBaseUrl, mc.read );
app.put( `${messagesBaseUrl}`, mc.update );
app.delete( `${messagesBaseUrl}`, mc.delete );

const port = 3000;
app.listen( port, () => { console.log(`Server listening on port ${port}.`); } );
```

</details>

## Step 3

### Summary

In this step, we will create a filter middleware file that will handle filtering messages with profanity.

### Instructions

* Create a file called `filter.js` in `server/middlewares/`.
* Open `server/middlewares/filter.js`.
* At the very top of the file create an array of words that should be censored.
* Use `module.exports` to export a function that has a `req`, `res`, and `next` parameter.
* Copy in the following filter code:
  * <details>
    
    <summary> <code> filter logic </code> </summary>
    
    ```js
    while ( notAllowed.find( word => req.body.text.includes(word) ) ) {
      const badWord = notAllowed.find( word => req.body.text.includes(word) );
      req.body.text = req.body.text.replace( badWord, '*'.repeat( badWord.length ) );
    }
    ```
    
    </details>
* Call `next` after the `while` loop.

### Solution

<details>

<summary> <code> server/middlewares/filter.js </code> </summary>

```js
const notAllowed = [ 'poo', 'butt' ];

module.exports = function( req, res, next ) {
  while ( notAllowed.find( word => req.body.text.includes(word) ) ) {
    const badWord = notAllowed.find( word => req.body.text.includes(word) );
    req.body.text = req.body.text.replace( badWord, '*'.repeat( badWord.length ) );
  }

  next();
};
```

</details>

## Step 4

### Summary

In this step, we'll require `server/middlewares/filter.js` in `server/index.js` and check if the method of the request is `POST` or `PUT`. If it is `POST` or `PUT`, we'll call our `filter` middleware to `filter` the `text` from the `request` body.

### Instructions

* Open `server/index.js`.
* Require `server/middlewares/filter.js` in a variable called `filter`.
* Add middleware to app that captures `req`, `res`, and `next`.
* Check if the method of the request is `POST` or `PUT`. If it is `POST` or `PUT`, call `filter` with `req`, `res`, and `next` as arguments. Otherwise just invoke `next`.
  * The method of a request is defined on `req.method`.

### Solution

<details>

<summary> <code> server/index.js </code> </summary>

```js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mc = require( `${__dirname}/controllers/messages_controller` );

const createInitialSession = require( `${__dirname}/middlewares/session.js` );
const filter = require( `${__dirname}/middlewares/filter.js`);

const app = express();

app.use( bodyParser.json() );
app.use( express.static( `${__dirname}/../public/build` ) );
app.use( session({
  secret: '@nyth!ng y0u w@nT',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 10000 }
}));

app.use( ( req, res, next ) => createInitialSession( req, res, next ) );
app.use( ( req, res, next ) => {
  const { method } = req;
  if ( method === "POST" || method === "PUT" ) {
    filter( req, res, next );
  } else {
    next();
  }
});

const messagesBaseUrl = "/api/messages";
app.post( messagesBaseUrl, mc.create );
app.get( messagesBaseUrl, mc.read );
app.put( `${messagesBaseUrl}`, mc.update );
app.delete( `${messagesBaseUrl}`, mc.delete );

const port = 3000;
app.listen( port, () => { console.log(`Server listening on port ${port}.`); } );
```

</details>

## Step 5

### Summary

In this step, we'll update the `messages` controller to add new messages to a user's session and modify the `update` and `delete` methods to use `query parameters` instead. We'll also add a `history` endpoint that will allow us to see messages on the session.

### Instructions

* Open `server/controllers/messages_controller.js`.
* Modify the `create` method to add the new message object to the `messages` array on session as well.
* Modify the `update` method to use `id` off the `request` query.
* Modify the `delete` method to use `id` off the `request` query.
* Create a `history` method that will return all `messages` on a user's session.
* Open `server/index.js`.
* Create a `GET` endpoint at `/api/messages/history` that calls the `history` method from the `messages` controller.

### Solution

<details>

<summary> <code> server/controllers/messages_controller.js </code> </summary>

```js
let messages = [];
let id = 0;

module.exports = {
  create: ( req, res ) => {
    const { text, time } = req.body;
    const { user } = req.session;

    messages.push({ id, text, time });
    user.messages.push({ id, text, time });
    id++;

    res.status(200).send( messages );
  },

  read: ( req, res ) => {
    res.status(200).send( messages );
  },

  update: ( req, res ) => {
    const { text } = req.body;
    const updateID = req.query.id;
    const messageIndex = messages.findIndex( message => message.id == updateID );
    let message = messages[ messageIndex ];

    messages[ messageIndex ] = {
      id: message.id,
      text: text || message.text,
      time: message.time
    };

    res.status(200).send( messages );
  },

  delete: ( req, res ) => {
    const deleteID = req.query.id;
    messageIndex = messages.findIndex( message => message.id == deleteID );
    messages.splice(messageIndex, 1);
    res.status(200).send( messages );
  },

  history: ( req, res ) => {
    const { user } = req.session;
    res.status(200).send( user.messages );
  }
};
```

</details>

<details>

<summary> <code> server/index.js </code> </summary>

```js
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mc = require( `${__dirname}/controllers/messages_controller` );

const createInitialSession = require( `${__dirname}/middlewares/session.js` );
const filter = require( `${__dirname}/middlewares/filter.js`);

const app = express();

app.use( bodyParser.json() );
app.use( express.static( `${__dirname}/../public/build` ) );
app.use( session({
  secret: '@nyth!ng y0u w@nT',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 10000 }
}));

app.use( ( req, res, next ) => createInitialSession( req, res, next ) );
app.use( ( req, res, next ) => {
  const { method } = req;
  if ( method === "POST" || method === "PUT" ) {
    filter( req, res, next );
  } else {
    next();
  }
});

const messagesBaseUrl = "/api/messages";
app.post( messagesBaseUrl, mc.create );
app.get( messagesBaseUrl, mc.read );
app.put( `${messagesBaseUrl}`, mc.update );
app.delete( `${messagesBaseUrl}`, mc.delete );
app.get( `${messagesBaseUrl}/history`, mc.history );

const port = 3000;
app.listen( port, () => { console.log(`Server listening on port ${port}.`); } );
```

</details>

## Step 6

### Summary

In this step, we'll use the `front-end` to see if the `history` endpoint is working.

### Instructions

* Use `nodemon` or `node index.js` when in `server/` to start the server.
* Go to `localhost:3000` in your browser.
* Send some messages and then check the history.
* Wait 10 seconds and re-check the history.
  * The history should now be blank since the session has been set to expire in 10 seconds.
  * To refresh the history, toggle it off and on. 

### Solution

<img src="https://github.com/DevMountain/node-chat-sessions/blob/solution/readme-assets/1g.gif" />

## Contributions

If you see a problem or a typo, please fork, make the necessary changes, and create a pull request so we can review your changes and merge them into the master repo and branch.

## Copyright

© DevMountain LLC, 2017. Unauthorized use and/or duplication of this material without express and written permission from DevMountain, LLC is strictly prohibited. Excerpts and links may be used, provided that full and clear credit is given to DevMountain with appropriate and specific direction to the original content.

<p align="center">
<img src="https://devmounta.in/img/logowhiteblue.png" width="250">
</p>


