require('dotenv').config(); //required for us to use process.env
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const routes = require('./routes');  
//leads to the routes folder, each "route" in the route folder signifies a seperate piece of the functionality of the program
//So each .js file in the routes folder controls a different aspect of the functionality.

const { createTunnel } = require('./tunnelHelper/tunnel');
//get the createTunnel function for use in, you quessed it, creating a tunnel. 

const port = process.env.PORT;
//get the prot from the .evn file


app.use(bodyParser.json()) //this is so we can deal with JSON info in POST requests

app.use(function(req, res, next) {
  console.log(req.method + " " + req.path + " - " + req.ip);
  next();
});

app.use(routes); //tells the app to handle requests using the .js files in routes

//Tell the app to listen at port, and then create a tunnel.
app.listen(port, () => {
  createTunnel(port);
});

module.exports = app; 

//const {authRequestMiddleware} = require('./middleware/auth-request')

/*
app.use(bodyParser.urlencoded({extended: false})) //this is so we can deal with JSON info in POST requests easier. Not used currently

//Whenever any request is sent to the app, log the type of request it was, i.e POST, GET
//The path it was sent to, and the IP Adress of the sender. 
app.use(function(req, res, next) {
  console.log(req.body);
  console.log(req.method + " " + req.path + " - " + req.ip);
  next();
});

//Whenever a post request is sent to path ./hi, log "test" and the body of the request to the console. 
app.post("/hi", authRequestMiddleware, function(req, res){	
  console.log('printRequest', JSON.stringify(req.body));
  res.status(200);
});
*/


//exports, this will be used in other files to export functions. 
//Set a function we want to use, export it, then set the file is was in a require const at the top of file, then use the functions. 
//Doing this, we can organize the code and stuff. 