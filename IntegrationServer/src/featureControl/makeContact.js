const { google } = require('googleapis');
const oAuth2Client = require('../temp').help
google.options({ auth: oAuth2Client });
var service = google.people({ version: 'v1', auth: oAuth2Client });
const fs = require('fs');
async function makeNewContact(req, res) {

	//gets the contact info from monday.com
	newContact = {
		ItemID: req.body.payload.inboundFieldValues.itemId,
		ContactName: req.body.payload.inboundFieldValues.itemMapping.name,
	}

	//Splits the contact into an array to seperate first, middle, last
	//If there is only a first the other values will be undifined which the api call can handle
	const nameArr = newContact.ContactName.split(" ");

	//If there is no middle, the last name needs to be assigned to nameArr[2] for the api call
	if (nameArr.length == 2) {
		nameArr[2] = nameArr[1];
		nameArr[1] = "";
	}
	
	//Creates or updates the itemIDs.txt file
	fs.appendFile('./itemIDs.txt', newContact.ItemID + "\n", (err) => { })
	console.log("Updated itemIDs.txt");

	//calls the people api
	service.people.createContact({
		requestBody: {
			names: [
				{
					displayName: newContact.ContactName,
					familyName: nameArr[2],
					givenName: nameArr[0],
					middleName: nameArr[1],
				},
			],
		}
	},

	//Throws an error or creates/appends to the contactIDs file and etags file
		(err, res) => {
			if (err) return console.error('The API returned an error: ' + err)
			fs.appendFile('./contactIDs.txt', res.data.resourceName + "\n", (err) => { })
			console.log("Updated contactIDs.txt");
			fs.appendFile('./etags.txt', res.data.etag + "\n", (err) => { })
			console.log("Updated etags.txt");
			console.log(" ");
		}
	);

	return res.status(200).send({});
};

module.exports = {
	makeNewContact
};