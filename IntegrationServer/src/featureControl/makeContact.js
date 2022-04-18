const {google} = require('googleapis');
const oAuth2Client = require('../temp').help
google.options({auth: oAuth2Client});

const service = google.people( {version: 'v1', auth: oAuth2Client});

const contactMappingService = require('../services/database-services/contact-mapping-service');

const {getBoardItems} = require('../services/mondayService.js');
const fs = require('fs');

async function makeNewContact(req, res){
	//gets the contact info from monday.com
	let itemMap = req.body.payload.inboundFieldValues.itemMapping
	let itemID = JSON.stringify(req.body.payload.inboundFieldValues.itemId);
	
	let name = itemMap.name
	let primaryEmail = itemMap.email
	let secondaryEmail = itemMap.email2
	let workPhone = itemMap.phone
	let mobilePhone = itemMap.phone7
	let notes = itemMap.text4
	
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
};
async function populateContacts(req, res){
	const boardItems = await getBoardItems(req.session.shortLivedToken, req.body.payload.inputFields.boardID)
	let boardItemIndex = 0;
	let doConfig = true;
	let config = [];
	while (boardItemIndex < boardItems.length) {
		let columnValuesIndex = 0;
		let currentItem = boardItems[boardItemIndex];

		let name = currentItem.name
		let arrName = name.split(" ", 1)
		let arrEmails = [];
		let arrPhoneNumber = [];
		let arrNotes = [];
		let itemID = '';
		if (doConfig == true) {
			while (columnValuesIndex < currentItem.column_values.length) {
				let currentColumn = currentItem.column_values[columnValuesIndex]
				let columnId = currentColumn.id;
				if (boardItemIndex == 0 && (process.env.WORK_PHONE_TITLE === currentColumn.title || process.env.MOBILE_PHONE_TITLE === currentColumn.title || process.env.EMAIL_PRIMARY_TITLE === currentColumn.title || process.env.EMAIL_SECONDARY_TITLE === currentColumn.title || process.env.NOTES_TITLE === currentColumn.title)) {
					let obj = {
						id: columnId,
						title: currentColumn.title
					};
					config.push(obj);
					console.log(currentColumn.title + ' ' + currentColumn.id);
				}
				columnValuesIndex++;
			}
			let temp2 = {
				"columnIds": config
			};
			if (!(fs.existsSync("./columnid-config.json"))) {
				fs.writeFile("./columnid-config.json", JSON.stringify(temp2), (err) => {
					if (err) return res.status(500).json({
						error: 'Internal Server Error'
					});
					console.log('config stored to ./columnid-config.json');
				});
			}
			doConfig = false;
		}
		else {
			while (columnValuesIndex < currentItem.column_values.length) {

				let currentColumn = currentItem.column_values[columnValuesIndex]
				let columnId = currentColumn.id
				switch (columnId) {
					case 'email':		//Primary Email
						arrEmails.push({ value: currentColumn.text, type: 'work', formattedType: 'Work' });
						break;
					case 'email2':		//Secondary Email
						arrEmails.push({ value: currentColumn.text, type: 'other', formattedType: 'Other' });
						break;
					case 'phone':		//Work Phone
						var number = currentColumn.text;
						if (number.length == 10) {
							number = '1 (' + number.slice(0, 3) + ') ' + number.substring(3, 6) + '-' + number.substring(6, 10);
						}
						arrPhoneNumber.push({ value: number, type: 'work', formattedType: 'Work' });
						break;
					case 'phone7':		//Mobile Phone
						var number = currentColumn.text;
						if (number.length == 10) {
							number = '1 (' + number.slice(0, 3) + ') ' + number.substring(3, 6) + '-' + number.substring(6, 10);
						}
						arrPhoneNumber.push({ value: number, type: 'mobile', formattedType: 'Mobile' });
						break;
					case 'text4':		//Notes
						arrNotes.push({ value: currentColumn.text, contentType: 'TEXT_PLAIN' });
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
	}
	return res.status(200).send({});
}

module.exports = {
	makeNewContact,
	populateContacts
};