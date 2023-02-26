const {google} = require('googleapis');
const fs = require('fs');

const {setConfigVariables} = require('./config/config-helper.js');


const OAuth2Client = require('./OAuth/google-auth.js').OAuthClient


//if the OAuth token.json file exists, read it and set the OAuth2Client.credentials to the contents of the file
//if the OAuth token.json file does not exist, do nothing.
async function setOAuthCredentials () {
	if (fs.existsSync("./token.json")) {
		await fs.readFile("./token.json", (err, token) => {
            OAuth2Client.credentials = JSON.parse(token);
			console.log("OAuth Credentials Set");
		});
	} else { //No token.json found
		console.log("No token found");
	}
}


//if the config.json file exists, read it and sent the contents to be loaded for the API to use.
//if config.json does not exist, do nothing.
async function loadConfigVariables () {
	if (fs.existsSync("./config.json")) {
		await fs.readFile("./config.json", async (err, config) => {
			try{	
				console.log("loading config");
				config = JSON.parse(config)
				await setConfigVariables(config);
				console.log("configs loaded");
			}
			catch{
				console.error("Invalid or corrupt config.json file");
			}
		});
	} else { //No token.json found
		console.log("No config found");
	}
}


module.exports = 
{
	loadConfigVariables,
	setOAuthCredentials,
};