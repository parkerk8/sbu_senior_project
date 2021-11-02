var express = require('express');
var bodyParser = require('body-parser');
var app = express();

const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`)
})

app.use(bodyParser.urlencoded({extended: false})) //this is so we can deal with JSON info in POST requests easier. Not used currently

//Whenever any request is sent to the app, log the type of request it was, i.e POST, GET
//The path it was sent to, and the IP Adress of the sender. 
app.use(function(req, res, next) {
  console.log(req.method + " " + req.path + " - " + req.ip);
  next();
})

//Whenever any request is sent to the path ./hi, log "HELP" to the console. 
app.use("/hi", function(req, res, next){
res.end("HELP");
console.log("HELP");
res.statusCode = 200;
next();
});

//Whenever a post request is sent to path ./hi, log "test" and the body of the request to the console. 
app.post("/hi", function(req, res){
	console.log("test");
	console.log(req.body);
});


module.exports = app; 
//exports, this will be used in other files to export functions. 
//Set a function we want to use, export it, then set the file is was in a require const at the top of file, then use the functions. 
//Doing this, we can organize the code and stuff. 