const {google} = require('googleapis');
const fs = require('fs');
const readline = require('readline');
const express = require('express');
const router = express.Router();
var app = express();
const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: 1000, useClones: false});



const oAuth2Client = new google.auth.OAuth2(
      "232811749250-phji8o1bmnd86b3vff1uetdkp12138vi.apps.googleusercontent.com", //YOUR_CLIENT_ID
	  "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", //YOUR_CLIENT_SECRET
	  "http://localhost:3000/tokenHandle");

const scopes = [
	'https://www.googleapis.com/auth/contacts'
	];


function setUpOAuth (req, res) {
	console.log(req.session.backToUrl);
	console.log("Hello");
	
	if (fs.existsSync("./token.json")) 
	{
		const TOKEN_PATH = "./token.json"
        fs.readFile("./token.json", (err, token) => {
            if (err)
			{
				console.error(err);
				return;
			}
            oAuth2Client.setCredentials(JSON.parse(token));
            console.log("it work 99");
			let returnUrl = req.session.backToUrl;
			return res.redirect(returnUrl);
        });
	}
	else
	{
	console.log("why");
	myCache.set( "returnURl", req.session.backToUrl);
	
	let url = oAuth2Client.generateAuthUrl({
		access_type: 'offline', // 'online' (default) or 'offline' (gets refresh_token)
		scope: scopes 			// If you only need one scope you can pass it as a string
	});
	return res.redirect(url);
	}
}

function codeHanlde (req, res) {
	//Creates a new token or detects if a token already exists

	backToUrl = myCache.get("returnURl");
	
    if (!(fs.existsSync("./token.json"))) {
        const TOKEN_PATH = "./token.json"
        const code = req.query['code'];
        console.log(code);
 
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.setCredentials(token);
            console.log(token);
            fs.writeFile(TOKEN_PATH, JSON.stringify(token), (err) => {
                if (err) return console.error(err);
                console.log('Token stored to', TOKEN_PATH);
            });
            //Store the token to disk for later program executions
        });
        return res.redirect(backToUrl);
    }
    //If the token exists, sets up OAuth2 client
    else {
       const TOKEN_PATH = "./token.json"
        fs.readFile("./token.json", (err, token) => {
            //if (err) return getNewToken(oAuth2Client, callback);
            oAuth2Client.setCredentials(JSON.parse(token));
            console.log("it work");
        });
        return res.redirect(backToUrl);
    }
}

module.exports = {
	codeHanlde,
	setUpOAuth
};
