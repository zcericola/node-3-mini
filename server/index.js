const express = require('express');
const bodyParser = require('body-parser');
const mc = require( `./controllers/messages_controller` );

const app = express();

app.use( bodyParser.json() );
app.use( express.static( `${__dirname}/build` ) );

const messagesBaseUrl = "/api/messages";
app.post( messagesBaseUrl, mc.create );
app.get( messagesBaseUrl, mc.read );
app.put( `${messagesBaseUrl}`, mc.update );
app.delete( `${messagesBaseUrl}`, mc.delete );

const port = process.env.PORT || 3000
app.listen( port, () => { console.log(`Server listening on port ${port}.`); } );