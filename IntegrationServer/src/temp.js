const {google} = require('googleapis');
const fs = require('fs');

const OAuth2Client = new google.auth.OAuth2(
      "232811749250-phji8o1bmnd86b3vff1uetdkp12138vi.apps.googleusercontent.com", //YOUR_CLIENT_ID
	  "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", //YOUR_CLIENT_SECRET
	  "http://localhost:3000/tokenHandle");


async function setOAuthCredentials () {
	if (fs.existsSync("./token.json")) {
		await fs.readFile("./token.json", (err, token) => {
            OAuth2Client.credentials = JSON.parse(token);
		});
	}
	else
	{
		console.log("No token found");
	}
}


module.exports = 
{
	setOAuthCredentials,
	'help': OAuth2Client
};