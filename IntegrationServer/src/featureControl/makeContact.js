
const { google } = require('googleapis');
const oAuth2Client = require('../temp').help
google.options({ auth: oAuth2Client });
var service = google.people({ version: 'v1', auth: oAuth2Client });
const fs = require('fs');
async function makeNewContact(req, res) {

	newContact = {
		ItemID: req.body.payload.inboundFieldValues.itemId,
		ContactName: req.body.payload.inboundFieldValues.itemMapping.name,
	}
	console.log(newContact);

	//takes monday.com data and formats it for a json object
	json = JSON.stringify(newContact);

	//Creates/replaces the json file of data to be pushed
	fs.writeFile('./newContact.json', json, (err) => {
		if (!err) {
			console.log('yes');
		}
	})

	fs.readFile('newContact.json',
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
					fs.appendFile('./contactKeys.txt', res.data.resourceName + "\n", (err) => { })
					console.log("Updated contactKeys.js");
					console.log(" ");
			}
			);
		}
	)

	console.log('Item ID: ', JSON.stringify(req.body.payload.inboundFieldValues.itemId));
	console.log('Contact Name: ', JSON.stringify(req.body.payload.inboundFieldValues.itemMapping.name));
	console.log(" ");
	console.log(req.query);
	return res.status(200).send({});
};

module.exports = {
	makeNewContact
};