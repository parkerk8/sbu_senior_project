require('dotenv').config(); //required for us to use process.env
var express = require('express');
var bodyParser = require('body-parser');
var app = express();

const routes = require('./routes');  
//this will import all of the exported router objects from the routes folder into this file
//Telling the app to listen at with this passed in will enable all the enpoints defined.


//load in needed funcitons
const {createTunnel} = require('./tunnelHelper/tunnel');
const {setOAuthCredentials} = require('./startup-helper.js');
const {loadConfigVariables} = require('./startup-helper.js');											   

//require file to make it's code run upon startup.
require('./OAuth/token-store-periodic.js');




const port = process.env.PORT;


app.use(bodyParser.json())
//This will act as middleware that all requests will get filtered through
//It will allow the body of all the POST requests sent to the API to read and used. 

//Print the method, path, and ip of all requests. This will act as middleware that all requests are filtered through.
app.use(function(req, res, next) {
  console.log(req.method + " " + req.path + " - " + req.ip);
  //console.log(req.query);
  next();
});

//run startup funcitons
setOAuthCredentials();

loadConfigVariables();

app.use(routes); //Tells the App to mount the paths contained in the router object imported from routes/index.js


//Tell the app to listen at port, and then create a tunnel.
app.listen(port, () => {
  createTunnel(port);
});



module.exports = app; 