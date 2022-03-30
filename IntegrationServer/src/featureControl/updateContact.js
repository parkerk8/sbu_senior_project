const { google } = require('googleapis');
const oAuth2Client = require('../temp').help
google.options({ auth: oAuth2Client });
var service = google.people({ version: 'v1', auth: oAuth2Client });
const fs = require('fs');
async function updateContactInfo(req, res) {
	//puts monday.com data into one place
	updateContact = {
		ItemID: req.body.payload.inboundFieldValues.itemId,
		ColumnID: req.body.payload.inboundFieldValues.columnId,
		//NewValue: req.body.payload.inboundFieldValues.columnValue,
		NewValue: req.body.payload.inboundFieldValues.itemMapping.text,
		NewVersionOfItem: req.body.payload.inboundFieldValues.itemMapping
	}
	console.log(updateContact);

	//takes monday.com data and formats it for a json object
	json = JSON.stringify(updateContact);

	//Creates/replaces the json file of data to be pushed
	fs.writeFile('./updateContact.json', json, (err) => { })

	var itemIDsArr = fs.readFileSync("./itemIDs.txt")
		.toString('UTF8')
		.split('\n');

	var contactIDsArr = fs.readFileSync("./contactIDs.txt")
		.toString('UTF8')
		.split('\n');

	var etagsArr = fs.readFileSync("./etags.txt")
		.toString('UTF8')
		.split('\n');

	var contactID;
	var contactEtag;
	var len = itemIDsArr.length;

	for (var i = 0; i < len; i++) {
		if (updateContact.ItemID == itemIDsArr[i]) {
			contactID = contactIDsArr[i];
			contactEtag = etagsArr[i];
		}
	}

	//console.log(etag);



	fs.readFile('updateContact.json',
		function (err, data) {
			var jsonData = data;
			var jsonParsed = JSON.parse(jsonData);

			//console.log(oAuth2Client);
			console.log(contactEtag);
			console.log(contactID);
			service.etag = contactEtag;
			//console.log(service.people.etag);
			service.people.updateContact({
				resourceName: contactID,
				
				//headers: {
					//"If-None-Match": contactEtag,
                //},
				//etag: "string",
				requestBody: {

				metadata: {
					sources: [
						{
							etag: contactEtag,
						}
					],
				},

				names: [
					{
						displayName: jsonParsed.text,
						familyName: jsonParsed.text,
						//givenName: 'Tim',
					},
				],
				emailAddresses: [
					{
						value: jsonParsed.NewValue.value,
					}
				],
				},
			},

				(err, res) => {
					if (err) return console.error('The API returned an error: ' + err)
					console.log(" ");
					console.log(res);
				}
			);
		}
	)

	//jsonfile.writeFile('Item ID: ', JSON.stringify(req.body.payload.inboundFieldValues.itemId)

	console.log('Item ID: ', JSON.stringify(req.body.payload.inboundFieldValues.itemId));
	console.log('Column ID: ', JSON.stringify(req.body.payload.inboundFieldValues.columnId));
	console.log('New Value: ', JSON.stringify(req.body.payload.inboundFieldValues.columnValue));
	console.log('New version of item: ', JSON.stringify(req.body.payload.inboundFieldValues.itemMapping));
	console.log(" ");
	return res.status(200).send({});
};

module.exports = {
	updateContactInfo,
};