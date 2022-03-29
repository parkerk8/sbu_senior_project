const fs = require('fs');
async function updateContactInfo(req, res) {
    //puts monday.com data into one place
    updateContact = {
        ItemID: req.body.payload.inboundFieldValues.itemId,
        ColumnID: req.body.payload.inboundFieldValues.columnId,
        NewValue: req.body.payload.inboundFieldValues.columnValue,
        NewVersionOfItem: req.body.payload.inboundFieldValues.itemMapping
    }
	console.log(updateContact);

    //takes monday.com data and formats it for a json object
	json = JSON.stringify(updateContact);

    //Creates/replaces the json file of data to be pushed
	fs.writeFile('./updateContact.json', json, (err) => {
        if (!err) {
            console.log('yes');
        }
    })

	fs.readFile('updateContact.json',
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