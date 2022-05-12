const schedule = require('node-schedule');
const fs = require('fs');
const {google} = require('googleapis');

const OAuth2Client = require('./google-auth.js').OAuthClient

google.options({auth: OAuth2Client});


schedule.scheduleJob('0 * * * *', useAccessToken); 


 // Sends a blank request to the google API, which updates the access token, and prevents it from
 // expiring in the event the API is not used for weeks on end.
function useAccessToken() {
	if(!(Object.keys(OAuth2Client.credentials).length === 0))//prevent it from running if no credentials are set
	{
		//Send a blank request to google APi, this will update the access token, and prevent it from expiring in the event the API is not used for weeks on end.
		var service = google.people({ version: 'v1', auth: OAuth2Client });
		service.people.connections.list({
			pageSize:1,
			resourceName: 'people/me',
			personFields: 'metadata'
		}, (err, res) => { 
			if (err) return console.error('The API returned an error: ' + err)
			updateToken()
		}
		);
	}
	else
	{
		console.log('No credentials set for access token update');
	}
}




 // Checks if the token.json file exists, if it does, it reads the file and compares it to the
 // current credentials, if they are different, it writes the new credentials to the file.

function updateToken(){
	credentials = JSON.stringify(OAuth2Client.credentials)
		
	if(fs.existsSync("./token.json"))
	{
		fs.readFile("./token.json", (err, token) => {
			if (err) return console.error(err);
			if(!(token == credentials))
			{
				fs.writeFile("./token.json", credentials, (err) => {
					if (err) return console.error(err);
					console.log('cached token updated');
				});
			}
			else
			{
				console.log('no car');
			}	
       });
	}
	console.log("hi");
}

module.exports = {
	updateToken
};


//look in ouath client for credentials, if they exist, override whtat is token.json