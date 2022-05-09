const {google} = require('googleapis');
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient
google.options({auth: OAuth2Client});

const service = google.people({version: 'v1', auth: OAuth2Client});

const contactMappingService = require('../services/database-services/contact-mapping-service');

let {configVariables} = require('../config/config-helper.js');

async function updateContactInfo(req, res){
	//puts monday.com data into one place
	console.log(" ");
	await console.log(Date.now());

		
	let itemMap = req.body.payload.inboundFieldValues.itemMapping
	let changedCollumnId = req.body.payload.inboundFieldValues.columnId
	let itemID = JSON.stringify(req.body.payload.inboundFieldValues.itemId);
	if(changedCollumnId == configVariables.primaryEmailID ||changedCollumnId == configVariables.secondaryEmailID || changedCollumnId == configVariables.workPhoneId || changedCollumnId == configVariables.mobilePhoneID ||changedCollumnId == configVariables.notesID)
	{
		let name = itemMap.name
		let primaryEmail = itemMap[configVariables.primaryEmailID];
		let secondaryEmail = itemMap[configVariables.secondaryEmailID];
		let workPhone = itemMap[configVariables.workPhoneId];
		let mobilePhone = itemMap[configVariables.mobilePhoneID];
		let notes = itemMap[configVariables.notesID];
	
		//Splits the contact into an array to seperate first, middle, last
		//If there is only a first the other values will be undifined which the api call can handle
		const nameArr = await name.split(" ");
		//If there is no middle, the last name needs to be assigned to nameArr[2] for the api call
		if (nameArr.length == 2) {
			nameArr[2] = nameArr[1];
			nameArr[1] = "";
		}
	
	
		//Try to format moble and work phones 
		//TO DO: Add a way for extentions column to be included. Will probably just need a check for it's existance. 
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
	
		try{
			let {resourceName, etag} = await contactMappingService.getContactMapping(itemID);
			let help = await update(resourceName, etag, itemID, nameArr, primaryEmail, secondaryEmail, workPhone, mobilePhone, notes, update);
			console.log(help);
		}
		catch(err) {
			console.log("Catch block err: " + err);
		}
		return res.status(200).send({});
	}
	else
	{
		console.log("no change");
		return res.status(200).send({});
	}
}


async function update(resourceName, etag, itemID, nameArr, primaryEmail, secondaryEmail, workPhone, mobilePhone, notes, callback = undefined){
	await service.people.updateContact({
				resourceName: resourceName,
				sources: 'READ_SOURCE_TYPE_CONTACT',
				updatePersonFields: 'biographies,emailAddresses,names,phoneNumbers',
				requestBody: {
					etag: etag,	
					names: [
						{
							givenName: nameArr[0],
							middleName: nameArr[1],
							familyName: nameArr[2],
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
				if (err)
				{
					console.log('The API returned an error: ' + err);
					service.people.get({
						resourceName: resourceName,
						personFields: 'metadata',
					}, (err, res) => { 
						if (err) return console.error('The API returned an error: ' + err);
						if(callback) callback(res.data.resourceName, res.data.etag, itemID, nameArr, primaryEmail, secondaryEmail, workPhone, mobilePhone, notes);
					});
				}
				else
				{
					await contactMappingService.updateContactMapping(itemID,{resourceName: res.data.resourceName, etag: res.data.etag});
					console.log("done");
					console.log(Date.now());
				}
			} 
		);
}



module.exports = {
	updateContactInfo,
};