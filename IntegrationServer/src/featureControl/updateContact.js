const {google} = require('googleapis');
const contactMappingService = require('../services/database-services/contact-mapping-service');

const oAuth2Client = require('../temp').help
google.options({auth: oAuth2Client});

const service = google.people( {version: 'v1', auth: oAuth2Client});

async function updateContactInfo (req, res){
	//console.log(JSON.stringify(req.body));
	await console.log(Date.now());
	let arrName = [];
	let arrEmails = [];
	let arrPhoneNumber = [];
	let arrNotes = [];
	let itemID = JSON.stringify(req.body.payload.inboundFieldValues.itemId);

	let itemMap = req.body.payload.inboundFieldValues.itemMapping
	console.log(itemMap)



	let name = itemMap.name
	let primaryEmail = itemMap.email
	let secondaryEmail = itemMap.email2
	let workPhone = itemMap.phone
	let mobilePhone = itemMap.phone7
	let notes = itemMap.text4
	
	if(name != undefined)
	{
		console.log(name);
		arrName = await name.split(' ', 2)
		console.log(arrName);
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
		if(workPhone.length == 10) 
		{
			workPhone = '1 ('+ workPhone.slice(0,3) + ') ' +  workPhone.substring(3,6) + '-' + workPhone.substring(6,10);
		}
		await arrPhoneNumber.push({value: workPhone, type: 'work',formattedType: 'Work'});
	}
	if(mobilePhone != undefined)
	{
		console.log(mobilePhone);
		if(mobilePhone.length == 10) 
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
	
	
	try{
		let {resourceName, etag} = await contactMappingService.getContactMapping(itemID);
		
		await service.people.updateContact({
			resourceName: resourceName,
			sources: 'READ_SOURCE_TYPE_CONTACT',
			updatePersonFields: 'biographies,emailAddresses,names,phoneNumbers',
			requestBody: {
				etag: etag,	
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
			await contactMappingService.updateContactMapping(itemID,{resourceName: res.data.resourceName, etag: res.data.etag});
			console.log("done");
			await console.log(Date.now());
		} 
		);
		
		}
	catch(err) {
		console.log("Catch block err: " + err);
	}
	
	return res.status(200).send({});
};


module.exports = {
	updateContactInfo,
};