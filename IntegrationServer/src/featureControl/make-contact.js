const {google} = require('googleapis');
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient
google.options({auth: OAuth2Client});

const service = google.people( {version: 'v1', auth: OAuth2Client});

const contactMappingService = require('../services/database-services/contact-mapping-service');

var {configVariables} = require('../config/config-helper.js');

 
async function makeNewContact(req, res){
	//gets the contact info from monday.com
	let itemMap = req.body.payload.inboundFieldValues.itemMapping
	let itemID = JSON.stringify(req.body.payload.inboundFieldValues.itemId);
	
	let itemMapping = await contactMappingService.getContactMapping(itemID); 
	if(itemMapping != null)
	{
		console.log("Mapping already exists: aborting make contact");
		return res.status(200).send({}); 
	}
	else
	{
	let name = itemMap.name
	let primaryEmail = itemMap[configVariables.primaryEmailID];
	let secondaryEmail = itemMap[configVariables.secondaryEmailID];
	let workPhone = itemMap[configVariables.workPhoneId];
	let mobilePhone = itemMap[configVariables.mobilePhoneID];
	let notes = itemMap[configVariables.notesID];
	
	//Splits the contact into an array to seperate first, middle, last
	//If there is only a first the other values will be undifined which the api call can handle
	const nameArr = await name.split(" ", 2);
	//If there is no middle, the last name needs to be assigned to nameArr[2] for the api call
	
	/*if (nameArr.length == 2) {
		nameArr[2] = nameArr[1];
		nameArr[1] = "";
	}*/
	
	
	//Try to format moble and work phones 
	if(workPhone != undefined)
	{
		console.log(workPhone);
		if(workPhone.length == 10) 
		{
			workPhone = await '1 ('+ workPhone.slice(0,3) + ') ' +  workPhone.substring(3,6) + '-' + workPhone.substring(6,10);
		}
	}
	if(mobilePhone != undefined)
	{
		console.log(mobilePhone);
		if(mobilePhone.length == 10) 
		{
			mobilePhone = await '1 ('+ mobilePhone.slice(0,3) + ') ' +  mobilePhone.substring(3,6) + '-' + mobilePhone.substring(6,10);
		}
	}
	

	/*
	formatting for organizations feild in contacts, not currrently used. May be changed latter, leaving this here so we don't have to re-find-out how to format this

	organizations: [
					{
						name: updateContact.Company,
						title: updateContact.Role,
					}
				]
	*/
	//calls the people api
	await service.people.createContact({
		requestBody: {
			names: [
				{
					displayName: name,
					familyName: nameArr[2],
					givenName: nameArr[0],
					middleName: nameArr[1],
				},
			],
			emailAddresses: [
					{
						value: primaryEmail,
						type: 'work',
						formattedType: 'Work'
					},
					{
						value: secondaryEmail,
						type: 'other',
						formattedType: 'Other'
					},
				],
				phoneNumbers: [
					{
						value: workPhone,
						type: 'work',
						formattedType: 'Work'
					},	
					{
						value: mobilePhone,
						type: 'mobile',
						formattedType: 'Mobile'
					},
				],
				biographies: [
					{
						value: notes,
						contentType: 'TEXT_PLAIN'
					}
				],
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
	return res.status(200).send({});
	}
};



module.exports = {
	makeNewContact
};