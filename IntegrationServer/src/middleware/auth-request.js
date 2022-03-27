const jswtoken = require('jsonwebtoken'); //get the json webtoken library.

//So, basically, this function authenticates that the request that got sent from monday, is in fact from monday. Using the signing secrete, the contents of some of
//the headers in the post request are checked, and if they all suceed then the request is real (in theory) 
async function authRequestMiddleware(req, res, next) {
	try{
		//console.log(req.body);
		let authorization = req.headers.authorization;  //get the authentication info from the request. 
	
		//at this point, we actually try and verify the request. 
		//If the verifiy function fails, then we know that the request wasn't sent from our Monday app.
		const {accountId, userId, backToUrl, shortLivedToken } = jswtoken.verify(
			authorization,
			process.env.MONDAY_SIGNING_SECRET
		);  
		
		next();
	}
	catch (err) {
    console.error(err);
    res.status(500).json({ error: 'not authenticated' });
  }
}

async function helpME(req, res, next) {

	var service = google.people({ version: 'v1', auth: oAuth2Client });
	console.log(oAuth2Client);
	service.people.createContact({
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
	);
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

async function authOAuthSetUp (req, res, next) {
	try{
		let authorization = req.query.token;  //get the authentication info from the request. 
		
		//at this point, we actually try and verify the request. 
		//If the verifiy function fails, then we know that the request wasn't sent from our Monday app.
		const {accountId, userId, backToUrl, shortLivedToken } = jswtoken.verify(
			authorization,
			process.env.MONDAY_SIGNING_SECRET
		);  
		req.session = { accountId, userId, backToUrl, shortLivedToken };
		next();
	}
	catch (err) {
    console.error(err);
    res.status(500).json({ error: 'not authenticated'});
  }
}

module.exports = {
  authRequestMiddleware,
  authOAuthSetUp
};


//you need to