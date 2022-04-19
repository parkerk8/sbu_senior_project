require('dotenv').config(); //required for us to use process.env
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const routes = require('./routes');  
//leads to the routes folder, each "route" in the route folder signifies a seperate piece of the functionality of the program
//So each .js file in the routes folder controls a different aspect of the functionality.

const {createTunnel} = require('./tunnelHelper/tunnel');
const {setOAuthCredentials} = require('./startup-helper.js');
const {loadConfigVariables} = require('./startup-helper.js');											   

//get the createTunnel function for use in, you quessed it, creating a tunnel. 

const port = process.env.PORT;
//get the prot from the .evn file


app.use(bodyParser.json()) //this is so we can deal with JSON info in POST requests

app.use(function(req, res, next) {
  console.log(req.method + " " + req.path + " - " + req.ip);
  //console.log(req.query);
  next();
});

setOAuthCredentials();

loadConfigVariables();					  
app.use(routes); //tells the app to handle requests using the .js files in routes


//Tell the app to listen at port, and then create a tunnel.
app.listen(port, () => {
  createTunnel(port);
});



module.exports = app; 