const {google} = require('googleapis');
const fs = require('fs');
const readline = require('readline');
const express = require('express');
const router = express.Router();
const NodeCache = require( "node-cache" );
const myCache = new NodeCache( { stdTTL: 1000, useClones: false});


const OAuth2Client = new google.auth.OAuth2(
      "232811749250-phji8o1bmnd86b3vff1uetdkp12138vi.apps.googleusercontent.com", //YOUR_CLIENT_ID
	  "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", //YOUR_CLIENT_SECRET
	  "http://localhost:3000/tokenHandle") //backToUrl



const scopes = [
	'https://www.googleapis.com/auth/contacts'
	];


google.options({auth: OAuth2Client});




async function helpME (req, res, next){

    var service = google.people( {version: 'v1', auth: OAuth2Client});
	//console.log(OAuth2Client);
	
	/*service.people.updateContact({
	resourceName: 'people/c3605388454813633008',
	sources: 'READ_SOURCE_TYPE_CONTACT',
	updatePersonFields: 'names',
	requestBody: {
	  etag: 'hehehehe',	
     names: [
        {
          displayName: 'Timmmy Manuel',
          familyName: 'Manuellly',
          givenName: 'Timmmy',
        },
      ],
    } 
	}, (err, res) => { 
		if (err) return console.error('The API returned an error: ' + err)
		console.log(" ");
		console.log(res);	
	} 
	);*/
	
	/*let arr1 = []
	
	arr1.push({value: 'what@help.no',type: 'work',formattedType: 'Work'});
	arr1.push({value: 'gone@forever',type: 'other',formattedType: 'Other'});
	
	console.log(arr1);
	*/
	/*service.people.createContact({
	requestBody: {
		names: [
			{
			displayName: 'Test Manuel',
			familyName: 'Manuel',
			givenName: 'Test',
			},
		],
		emailAddresses: arr1,
    } 
	}, (err, res) => { 
		if (err) return console.error('The API returned an error: ' + err)
		console.log(" ");
		console.log(res);	
	} 
	);*/
	
	
	/*service.people.connections.list({
		pageSize:10,
		resourceName: 'people/me',
		personFields: 'addresses,ageRanges,biographies,birthdays,calendarUrls,clientData,coverPhotos,emailAddresses,events,externalIds,genders,imClients,interests,locales,locations,memberships,metadata,miscKeywords,names,nicknames,occupations,organizations,phoneNumbers,photos,relations,sipAddresses,skills,urls,userDefined'
	}, (err, res) => { 
		if (err) return console.error('The API returned an error: ' + err)
		console.log(res.data.nextPageToken)
		console.log(" ");
		console.log(res.data.connections[0]);
		var arr = res.data.connections;
		console.log(arr.length);
	}
  );*/
  
	service.people.get({
		resourceName: 'people/c5262138362990476404',
		personFields: 'addresses,ageRanges,biographies,birthdays,calendarUrls,clientData,coverPhotos,emailAddresses,events,externalIds,genders,imClients,interests,locales,locations,memberships,metadata,miscKeywords,names,nicknames,occupations,organizations,phoneNumbers,photos,relations,sipAddresses,skills,urls,userDefined'
	}, (err, res) => { 
		if (err) return console.error('The API returned an error: ' + err)
		console.log(" ");
		console.log(res.data);
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
            OAuth2Client.credentials = JSON.parse(token);;
			let returnUrl = req.session.backToUrl;
			return res.redirect(returnUrl);
        });
	}
	else
	{
	console.log("why");
	myCache.set( "returnURl", req.session.backToUrl);
	
	let url = OAuth2Client.generateAuthUrl({
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
 
        OAuth2Client.getToken(code, (err, token) => {
            if (err) return console.error('Error retrieving access token', err);
            OAuth2Client.credentials = token;
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
            //if (err) return getNewToken(OAuth2Client, callback);
            OAuth2Client.credentials = JSON.parse(token);
            console.log("it work");
        });
        return res.redirect(backToUrl);
    }
}




module.exports = {
	codeHanlde,
	setUpOAuth,
	helpME,
	'OAuthClient': OAuth2Client
};
