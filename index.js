const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mc = require( './controllers/messages_controller' );
const Path = require('path');
// require('dotenv').config()

const createInitialSession = require( `${__dirname}/middlewares/session.js` );
const filter = require( `${__dirname}/middlewares/filter.js`);

const app = express();

app.use( bodyParser.json() );
app.use( express.static( `${__dirname}/../build` ) );
app.use( session({
  secret: 'process.env.SESSION_SECRET',
  resave: false,
  saveUninitialized: true,
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

app.use( express.static( __dirname + '/public/build/') );
app.get( '*', ( req, res, next ) => {
  res.sendFile( Path.resolve( __dirname + '/public/build/index.html' ) );
});

const port = 10008;
app.listen( port, () => { console.log(`Server listening on port ${port}.`); } );