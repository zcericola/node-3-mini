const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const mc = require( './controllers/messages_controller' );
require('dotenv').config()

const createInitialSession = require( `${__dirname}/middlewares/session.js` );
const filter = require( `${__dirname}/middlewares/filter.js`);

const app = express();

app.use( bodyParser.json() );
app.use( express.static( `${__dirname}/build` ) );
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

const port = process.env.PORT || 3000;
app.listen( port, () => { console.log(`Server listening on port ${port}.`); } );