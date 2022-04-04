const {google} = require('googleapis');
const fs = require('fs');

const {getBoardItems} = require('../services/mondayService.js');
const oAuth2Client = require('../temp').help

google.options({auth: oAuth2Client});


async function makeNewContact (req, res){
console.log(JSON.stringify(req.body));
  console.log('Item ID: ', JSON.stringify(req.body.payload.inboundFieldValues.itemId));	
  console.log('Contact Name: ', JSON.stringify(req.body.payload.inboundFieldValues.itemMapping.name));
  console.log(" ");
  return res.status(200).send({});
};


async function populateContacts(req, res){
	var service = google.people( {version: 'v1', auth: oAuth2Client});
	const boardItems = await getBoardItems(req.session.shortLivedToken, req.body.payload.inputFields.boardID)
	let boardItemIndex = 0;
	while(boardItemIndex < boardItems.length)
	{
		let columnValuesIndex = 0;
		let currentItem = boardItems[boardItemIndex];
		
		let name = currentItem.name
		let arrName = name.split(" ", 1)
		let arrEmails = [];
		let arrPhoneNumber = [];
		let arrNotes = [];
		let itemID= '';
		
		while(columnValuesIndex < currentItem.column_values.length)
		{
			
			let currentColumn = currentItem.column_values[columnValuesIndex]
			let columnId = currentColumn.id
			switch(columnId){
				case 'email':		//Primary Email
					arrEmails.push({value: currentColumn.text ,type: 'work',formattedType: 'Work'});
					break;
				case 'email0':		//Secondary Email
					arrEmails.push({value: currentColumn.text ,type: 'other',formattedType: 'Other'});
					break;
				case 'phone':		//Work Phone
					arrPhoneNumber.push({canonicalForm: '+1'+currentColumn.text, type: 'work',formattedType: 'Work'});
					break;
				case 'phone4':		//Mobile Phone
					arrPhoneNumber.push({canonicalForm: '+1'+currentColumn.text, type: 'mobile',formattedType: 'Mobile'});
					break;
				case 'text4':		//notes
					arrNotes.push({value: currentColumn.text, contentType: 'TEXT_PLAIN'});
					break;
				case 'item_id':
					itemID = currentColumn.text;
					break;
					
			}
			columnValuesIndex++;
		}
		
		
		await service.people.createContact({
		requestBody: {
			names: [
				{
					displayName: name,
					familyName: arrName[1],
					givenName: arrName[0]
				},
			],
			emailAddresses: arrEmails,
			phoneNumbers: arrPhoneNumber,
			biographies: arrNotes,
		} 
		}, (err, res) => { 
			if (err) return console.error('The API returned an error: ' + err)
			console.log(itemID);
			console.log(res.data.resourceName);
			console.log(res.data.etag);	
			console.log(" ");
		} 
		);
		boardItemIndex++;
	}
	/*
	service.people.createContact({
	requestBody: {
      names: [
        {
          displayName: 'Tim Manuel',
          familyName: 'Manuel',
          givenName: 'Tim',
        },
      ],
    } 
	}, (err, res) => { 
		if (err) return console.error('The API returned an error: ' + err)
		console.log(" ");
		console.log(res);	
	} 
	);
	*/
	return res.status(200).send({});
}

module.exports = {
	makeNewContact,
	populateContacts
};