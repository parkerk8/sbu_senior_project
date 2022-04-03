const { google } = require('googleapis');
const oAuth2Client = require('../temp').help
google.options({ auth: oAuth2Client });
var service = google.people({ version: 'v1', auth: oAuth2Client });
const fs = require('fs');
async function updateContactInfo(req, res) {
	//puts monday.com data into one place
	updateContact = {
		ItemID: req.body.payload.inboundFieldValues.itemId,
		Name: req.body.payload.inboundFieldValues.itemMapping.name,
		ColumnID: req.body.payload.inboundFieldValues.columnId,
		//NewValue: req.body.payload.inboundFieldValues.columnValue,
		NewValue: req.body.payload.inboundFieldValues.itemMapping.text,
		NewValue2: req.body.payload.inboundFieldValues.itemMapping.text_1,
		NewVersionOfItem: req.body.payload.inboundFieldValues.itemMapping
	}
	console.log(req.body.payload.inboundFieldValues);

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
	var listNum;

	for (var i = 0; i < len; i++) {
		if (updateContact.ItemID == itemIDsArr[i]) {
			contactID = contactIDsArr[i];
			contactEtag = etagsArr[i];
			listNum = i;
		}
	}

	
	//console.log(etag);



	fs.readFile('updateContact.json',
		function (err, data) {
			var jsonData = data;
			var jsonParsed = JSON.parse(jsonData);
			console.log(jsonParsed.Name);
			console.log(jsonParsed.NewValue);
			console.log(jsonParsed.NewValue2);
			//console.log(jsonParsed.Name);

			//console.log(jsonParsed.NewValue);
			service.people.updateContact({
				resourceName: contactID,
				updatePersonFields: "emailAddresses,names",
				///updatePersonFields: "names",
				//headers: {
					//"If-None-Match": contactEtag,
                //},
				//etag: "string",
				requestBody: {
					etag: contactEtag,
					names: [
						{
							displayName: jsonParsed.Name,
							familyName: jsonParsed.Name,
							//givenName: 'Tim',
						},
					],
					emailAddresses: [
						{
							value: jsonParsed.NewValue,
							type: "work",
							displayName: jsonParsed.NewValue,
						},
						{
							value: jsonParsed.NewValue2,
							type: "Mobile",
							displayName: jsonParsed.NewValue2,
                        },
					],
				},
			},

				(err, res) => {
					if (err) return console.error('The API returned an error: ' + err)

						fs.unlink("./etags.txt", (err) => {
							if (!err) {
								console.log(" ");
								console.log("etags deleted");
								console.log(" ")
							}
						})
						console.log(" ");
						//console.log(res);
						etagsArr[listNum] = res.data.etag;
						console.log(etagsArr.length);
						len = etagsArr.length;
						//fs.appendFile('./etags.txt', etagsArr[listNum] + "\n", (err) => { });
						console.log(len);
						for (var i = 0; i+1 < len; i++) {
							fs.appendFile('./etags.txt', etagsArr[i] + "\n", (err) => { });
							console.log('./etags.txt');
						}
						//fs.appendFile('./etags.txt', "\n", (err) => { });
						
					
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