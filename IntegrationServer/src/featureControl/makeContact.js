const { google } = require('googleapis');
const oAuth2Client = require('../temp').help
google.options({ auth: oAuth2Client });
var service = google.people({ version: 'v1', auth: oAuth2Client });
const fs = require('fs');
async function makeNewContact(req, res) {

	contact = {
		ItemID: req.body.payload.inboundFieldValues.itemId,
		ContactName: req.body.payload.inboundFieldValues.itemMapping.name,
	}
	console.log(contact);

	//takes monday.com data and formats it for a json object
	json = JSON.stringify(contact);

	//Creates/replaces the json file of data to be pushed
	fs.writeFile('./contact.json', json, (err) => {
		if (!err) {
			console.log('yes');
		}
	})

	fs.readFile('contact.json',
		function (err, data) {
			var jsonData = data;
			var jsonParsed = JSON.parse(jsonData);

			console.log(oAuth2Client);
			service.people.createContact({
				requestBody: {
					names: [
						{
							displayName: jsonParsed.ContactName,
							familyName: jsonParsed.ContactName,
							//givenName: 'Tim',
						},
					],
				}
			}, (err, res) => {
				if (err) return console.error('The API returned an error: ' + err)
				console.log(" ");
				console.log(res);
			}
			);
		}
	)




	console.log('Item ID: ', JSON.stringify(req.body.payload.inboundFieldValues.itemId));
	console.log('Contact Name: ', JSON.stringify(req.body.payload.inboundFieldValues.itemMapping.name));
	console.log(" ");
	return res.status(200).send({});
};

module.exports = {
	makeNewContact
};