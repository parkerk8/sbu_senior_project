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
		PrimaryEmail: req.body.payload.inboundFieldValues.itemMapping.text,
		SecondaryEmail: req.body.payload.inboundFieldValues.itemMapping.text_1,
		WorkPhone: req.body.payload.inboundFieldValues.itemMapping.text9,
		MobilePhone: req.body.payload.inboundFieldValues.itemMapping.text6,
		Company: req.body.payload.inboundFieldValues.itemMapping.text95,
		Role: req.body.payload.inboundFieldValues.itemMapping.text7,
		//NewVersionOfItem: req.body.payload.inboundFieldValues.itemMapping
	}
	console.log(req.body.payload.inboundFieldValues);

	//Splits the contact into an array to seperate first, middle, last
	//If there is only a first the other values will be undifined which the api call can handle
	const nameArr = updateContact.Name.split(" ");

	//If there is no middle, the last name needs to be assigned to nameArr[2] for the api call
	if (nameArr.length == 2) {
		nameArr[2] = nameArr[1];
		nameArr[1] = "";
	}

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

	//console.log(jsonParsed.NewValue);
	service.people.updateContact({
		resourceName: contactID,
		updatePersonFields: "emailAddresses,names,phoneNumbers,orginizations",
		requestBody: {
			etag: contactEtag,
			names: [
				{
					displayName: updateContact.Name,
					givenName: nameArr[1],
					middleName: nameArr[2],
					familyName: nameArr[3],
				},
			],
			emailAddresses: [
				{
					value: updateContact.PrimaryEmail,
					type: "Primary",
					displayName: updateContact.PrimaryEmail,
				},
				{
					value: updateContact.SecondaryEmail,
					type: "Secondary",
					displayName: updateContact.SecondaryEmail,
				},
			],
			/*phoneNumbers: [
				{
					value: updateContact.WorkPhone,
					type: "Work",
				},
				{
					value: updateContact.MobilePhone,
					type: "Mobile",
				},
			],
			organizations: [
				{
					name: updateContact.Company,
					title: updateContact.Role,
                }
			]*/
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
		etagsArr[listNum] = res.data.etag;
		console.log(etagsArr.length);
		len = etagsArr.length;
		//fs.appendFile('./etags.txt', etagsArr[listNum] + "\n", (err) => { });
		console.log(len);
		for (var i = 0; i + 1 < len; i++) {
			fs.appendFile('./etags.txt', etagsArr[i] + "\n", (err) => { });
			console.log('./etags.txt');
		}
	});

	return res.status(200).send({});
};

module.exports = {
	updateContactInfo,
};