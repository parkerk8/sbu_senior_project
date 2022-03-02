require('dotenv').config(); //required for us to use process.env
var axios = require("axios").default;
const fs = require('fs');
const readline = require('readline');
var express = require('express');
var bodyParser = require('body-parser');
var app = express();
const routes = require('./routes');
const { google } = require('googleapis');
//leads to the routes folder, each "route" in the route folder signifies a seperate piece of the functionality of the program
//So each .js file in the routes folder controls a different aspect of the functionality.

const { createTunnel } = require('./tunnelHelper/tunnel');
//get the createTunnel function for use in, you quessed it, creating a tunnel. 

const port = process.env.PORT;
//get the prot from the .evn file

//const { sendAuthUrl } = require('./middleware/auth-sender');


app.use(bodyParser.json()) //this is so we can deal with JSON info in POST requests

app.use(function (req, res, next) {
    //Creates a new access token or detects if a token already exists
    const client_id = "232811749250-phji8o1bmnd86b3vff1uetdkp12138vi.apps.googleusercontent.com";
    const client_secret = "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";
    const redirect_uri = "http://localhost:3000";
    const oAuth2Client = new google.auth.OAuth2(
        client_id, client_secret, redirect_uri);
    //Creates an access token from the recieved auth code if one does not already exist
    if (!(fs.existsSync("./token.json"))) {
        const TOKEN_PATH = "./token.json"
        const code = req.query['code'];
        //Creates and stores the access token or throws an error message
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            console.log(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
                oAuth2Client.setCredentials(token);
            });
        });
        next();
    }
    //If the access token already exists, sets up OAuth2 client
    else {
        const TOKEN_PATH = "./token.json"
        fs.readFile(TOKEN_PATH, (err, token) => {
            oAuth2Client.setCredentials(JSON.parse(token));
            console.log("Token found");
        });
        next();
    }

    //Sends a post request with the refresh token to recieve a new access token
    console.log("sending refresh token");
    axios.post('https://oauth2.googleapis.com/token', {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        grant_type: 'refresh_token',
        client_id: '232811749250-phji8o1bmnd86b3vff1uetdkp12138vi.apps.googleusercontent.com',
        client_secret: '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',
        refresh_token: '1//04L2zUVYtcDXWCgYIARAAGAQSNwF-L9IreVYZ9RLI04qQ07IB5lPhf5vP2qkCwMG6VjNqsWXiPHQxH9yXU1Gaqid3BbSlrHtJ4p0'
    }).then(function (response) {
        //console.log(response.data);
    }).catch(function (error) {
        console.error(error);
    });

})

app.use(routes); //tells the app to handle requests using the .js files in routes



//Tell the app to listen at port, and then create a tunnel.
app.listen(port, () => {
  createTunnel(port);
});


module.exports = app;
//sendAuthUrl;