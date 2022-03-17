const {google} = require('googleapis');
const fs = require('fs');
const readline = require('readline');
const express = require('express');
const router = express.Router();
const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: 1000, useClones: false});


const oAuth2Client = require('../temp').help



const scopes = [
	'https://www.googleapis.com/auth/contacts'
	];


google.options({auth: oAuth2Client});




async function helpME (req, res, next){

    var service = google.people( {version: 'v1', auth: oAuth2Client});
	console.log(oAuth2Client);
	/*service.people.createContact({
	requestBody: {
      names: [
        {
          displayName: 'Tim Manuel',
          familyName: 'Manuel',
          givenName: 'Tim',
        },
      ],
    } 
	}, (err, res) => { 
		if (err) return console.error('The API returned an error: ' + err)
		console.log(" ");
		console.log(res);	
	} 
	);*/
	service.people.connections.list({
		resourceName: 'people/me',
		personFields: 'addresses,ageRanges,biographies,birthdays,calendarUrls,clientData,coverPhotos,emailAddresses,events,externalIds,genders,imClients,interests,locales,locations,memberships,metadata,miscKeywords,names,nicknames,occupations,organizations,phoneNumbers,photos,relations,sipAddresses,skills,urls,userDefined'
	}, (err, res) => { 
		if (err) return console.error('The API returned an error: ' + err)
		console.log(" ");
		console.log(res.data.connections[0]);	
	}
  );
  next();
  
};


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
            oAuth2Client.credentials = JSON.parse(token);;
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
	//console.log(JSON.stringify(req.headers));
	backToUrl = myCache.get("returnURl");
	
    if (!(fs.existsSync("./token.json"))) {
        const TOKEN_PATH = "./token.json"
        const code = req.query['code'];
        console.log(code);
 
        oAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            oAuth2Client.credentials = token;
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
            oAuth2Client.credentials = JSON.parse(token);
            console.log("it work");
        });
        return res.redirect(backToUrl);
    }
}




module.exports = {
	codeHanlde,
	setUpOAuth,
	helpME
};
