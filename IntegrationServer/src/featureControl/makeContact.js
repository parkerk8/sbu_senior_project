const {google} = require('googleapis');
const fs = require('fs');
const contactMappingService = require('../services/database-services/contact-mapping-service');

const {getBoardItems} = require('../services/mondayService.js');
const oAuth2Client = require('../temp').help

google.options({auth: oAuth2Client});

const service = google.people( {version: 'v1', auth: oAuth2Client});


async function makeNewContact (req, res){	
	let arrEmails = [];
	let arrPhoneNumber = [];
	let arrNotes = [];
	let arrName = [];
	
	let itemID = JSON.stringify(req.body.payload.inboundFieldValues.itemId);
	let name = req.body.payload.inboundFieldValues.itemMapping.name
	let primaryEmail = req.body.payload.inboundFieldValues.itemMapping.email
	let secondaryEmail = req.body.payload.inboundFieldValues.itemMapping.email2
	let workPhone = req.body.payload.inboundFieldValues.itemMapping.phone
	let mobilePhone = req.body.payload.inboundFieldValues.itemMapping.phone7
	let notes = req.body.payload.inboundFieldValues.itemMapping.text4
	
	
	if(name != undefined)
	{
		console.log(name);
		arrName = await name.split(" ", 1)
	}
	if(primaryEmail != undefined)
	{
		console.log(primaryEmail);
		await arrEmails.push({value: primaryEmail ,type: 'work',formattedType: 'Work'});
	}
	if(secondaryEmail != undefined)
	{
		console.log(secondaryEmail);
		await arrEmails.push({value: secondaryEmail ,type: 'other',formattedType: 'Other'});
	}
	if(workPhone != undefined)
	{
		console.log(workPhone);
		if(workPhone.length = 10) 
		{
			workPhone = '1 ('+ workPhone.slice(0,3) + ') ' +  workPhone.substring(3,6) + '-' + workPhone.substring(6,10);
		}
		await arrPhoneNumber.push({value: workPhone, type: 'work',formattedType: 'Work'});
	}
	if(mobilePhone != undefined)
	{
		console.log(mobilePhone);
		if(mobilePhone.length = 10) 
		{
			mobilePhone = '1 ('+ mobilePhone.slice(0,3) + ') ' +  mobilePhone.substring(3,6) + '-' + mobilePhone.substring(6,10);
		}
		await arrPhoneNumber.push({value: mobilePhone, type: 'mobile',formattedType: 'Mobile'});
	}
	if(notes != undefined)
	{	
		console.log(notes);
		await arrNotes.push({value: notes, contentType: 'TEXT_PLAIN'});
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
		}, async (err, res) => { 
			if (err) return console.error('The API returned an error: ' + err)
			await contactMappingService.createContactMapping({
				itemID,
				resourceName: res.data.resourceName, 
				etag: res.data.etag
			});
		} 
	);
	console.log('Item ID: ', JSON.stringify(req.body.payload.inboundFieldValues.itemId));	
	console.log('Contact Name: ', JSON.stringify(req.body.payload.inboundFieldValues.itemMapping.name));
	console.log(" ");
	return res.status(200).send({});
};


async function populateContacts(req, res){
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
				case 'email2':		//Secondary Email
					arrEmails.push({value: currentColumn.text ,type: 'other',formattedType: 'Other'});
					break;
				case 'phone':		//Work Phone
					var number = currentColumn.text;
					if(number.length == 10) 
					{
						number = '1 ('+ number.slice(0,3) + ') ' +  number.substring(3,6) + '-' + number.substring(6,10);
					}
					arrPhoneNumber.push({value: number, type: 'work',formattedType: 'Work'});
					break;
				case 'phone7':		//Mobile Phone
					var number = currentColumn.text;
					if(number.length == 10) 
					{
						number = '1 ('+ number.slice(0,3) + ') ' +  number.substring(3,6) + '-' + number.substring(6,10);
					}
					arrPhoneNumber.push({value: number, type: 'mobile',formattedType: 'Mobile'});
					break;
				case 'text4':		//Notes
					arrNotes.push({value: currentColumn.text, contentType: 'TEXT_PLAIN'});
					break;
				case 'item_id':
					itemID = currentColumn.text;
					break;
					
			}
			columnValuesIndex++;
		}
		//itemMapping = await contactMappingService.getContactMapping(itemID);   //As an example.
		//console.log(itemMapping);
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
		}, async (err, res) => { 
			if (err) return console.error('The API returned an error: ' + err)
			await contactMappingService.createContactMapping({
				itemID,
				resourceName: res.data.resourceName, 
				etag: res.data.etag
			});
		} 
		);
		boardItemIndex++;
	}
	return res.status(200).send({});
}

module.exports = {
	makeNewContact,
	populateContacts
};