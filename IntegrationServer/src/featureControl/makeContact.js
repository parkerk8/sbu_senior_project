const {google} = require('googleapis');
const OAuth2Client = require('../OAuth/googleAuth.js').OAuthClient
google.options({auth: OAuth2Client});

const service = google.people( {version: 'v1', auth: OAuth2Client});

const contactMappingService = require('../services/database-services/contact-mapping-service');

const {getBoardItems} = require('../services/mondayService.js');
const fs = require('fs');

var {configVariables} = require('../config/config-helper.js');
const setConfigVariables = require('../config/config-helper.js').setConfigVariables;

												 
async function makeNewContact(req, res){
	//gets the contact info from monday.com
	let itemMap = req.body.payload.inboundFieldValues.itemMapping
	let itemID = JSON.stringify(req.body.payload.inboundFieldValues.itemId);
	
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



async function populateContacts(req, res)
{
	const boardItems = await getBoardItems(req.session.shortLivedToken, req.body.payload.inputFields.boardID)
	let {createNewDatabase} = configVariables;
	console.log(createNewDatabase);
	
	if(createNewDatabase === true)
	{
		let err = await initalSetupGoogleContacts(boardItems);
		if(err)
		{
			console.error(err);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
		else
		{
			return res.status(200).send({});
		}
	}
	else if(createNewDatabase === false)
	{
		let err = await syncWithExistingContacts(boardItems)
		if(err)
		{
			console.error(err);
			return res.status(500).json({ error: 'Internal Server Error' });
		}
		else
		{
			return res.status(200).send({});
		}
	}
	else
	{
		console.error("uh oh big trouble");
		return res.status(500).json({ error: 'Internal Server Error' });
	}	
}


async function initalSetupGoogleContacts(boardItems){   //makes new database.
	let boardItemIndex = 0;
	let doConfig = true;
	
	await contactMappingService.deleteDatabse();
	
	while(boardItemIndex < boardItems.length)
	{
		let columnValuesIndex = 0;
		let currentItem = boardItems[boardItemIndex];
		
		let name = currentItem.name
		let arrName = name.split(" ", 2)
		let arrEmails = [];
		let arrPhoneNumber = [];
		let arrNotes = [];
		let itemID = '';
		
		if(doConfig == true)
		{
			let columnIdConfig = [];
			if (!(fs.existsSync("./config.json"))) 
			{
				while(columnValuesIndex < currentItem.column_values.length)
				{
					let currentColumn = currentItem.column_values[columnValuesIndex]
					let columnId = currentColumn.id;
					
					if(boardItemIndex == 0 && (process.env.WORK_PHONE_TITLE === currentColumn.title || process.env.MOBILE_PHONE_TITLE === currentColumn.title || process.env.EMAIL_PRIMARY_TITLE === currentColumn.title || process.env.EMAIL_SECONDARY_TITLE === currentColumn.title || process.env.NOTES_TITLE === currentColumn.title))
					{
						let obj = {
							id: columnId,
							title: currentColumn.title
						};
						
						columnIdConfig.push(obj);
						console.log(currentColumn.title + ' ' + currentColumn.id);
					}
					columnValuesIndex++;
				}
				let config = {"columnIds" : columnIdConfig,
							"settings":
								{
									"createNewDatabase": false
								}
				};
				await setConfigVariables(config)
				fs.writeFile("./config.json", JSON.stringify(config), (err) => {
                if (err) return err;
                console.log('config stored to ./config.json');
				});
            }
			else
			{
				let config = await fs.readFileSync("./config.json");
				config = await JSON.parse(config); 
				while(columnValuesIndex < currentItem.column_values.length)
				{
					let currentColumn = currentItem.column_values[columnValuesIndex]
					let columnId = currentColumn.id;
				
					if(boardItemIndex == 0 && (process.env.WORK_PHONE_TITLE === currentColumn.title || process.env.MOBILE_PHONE_TITLE === currentColumn.title || process.env.EMAIL_PRIMARY_TITLE === currentColumn.title || process.env.EMAIL_SECONDARY_TITLE === currentColumn.title || process.env.NOTES_TITLE === currentColumn.title))
					{
						let obj = {id: columnId,
								title : currentColumn.title};
							
						columnIdConfig.push(obj);				
						console.log(currentColumn.title + ' ' + currentColumn.id);
					}
					columnValuesIndex++;
				}
				
				config.columnIds = columnIdConfig;
				config.settings.createNewDatabase = false;
				
				await setConfigVariables(config)
	
				fs.writeFile("./config.json", JSON.stringify(config), (err) => {
                if (err) return err;
                console.log('config.json updated');
				});
			}
			doConfig = false;
		}
		else
		{
			while(columnValuesIndex < currentItem.column_values.length)
			{			
				let currentColumn = currentItem.column_values[columnValuesIndex]
				let columnId = currentColumn.id
				
				switch(columnId)
				{
					case configVariables.primaryEmailID:		//Primary Email
						arrEmails.push({value: currentColumn.text, type: 'work', formattedType: 'Work' });
						break;
					case configVariables.secondaryEmailID:		//Secondary Email
						arrEmails.push({value: currentColumn.text, type: 'other', formattedType: 'Other' });
						break;
					case configVariables.workPhoneId:		//Work Phone
						var number = currentColumn.text;
						if(number.length == 10)
						{
							number = '1 (' + number.slice(0,3) + ') ' + number.substring(3,6) + '-' + number.substring(6,10);
						}
						arrPhoneNumber.push({value: number, type: 'work', formattedType: 'Work' });
						break;
					case configVariables.mobilePhoneID:		//Mobile Phone
						var number = currentColumn.text;
						if(number.length == 10)
						{
							number = '1 (' + number.slice(0,3) + ') ' + number.substring(3,6) + '-' + number.substring(6,10);
						}
						arrPhoneNumber.push({value: number, type: 'mobile', formattedType: 'Mobile' });
						break;
					case configVariables.notesID:		//Notes
						arrNotes.push({value: currentColumn.text, contentType: 'TEXT_PLAIN' });
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
			}, async (err, res) => {
				if (err) return 'The API returned an error: ' + err;
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
	return null;
}

async function syncWithExistingContacts(boardItems){   //updates existing database.
	let boardItemIndex = 0;
	let doConfig = true;
	
	while(boardItemIndex < boardItems.length)
	{
		let columnValuesIndex = 0;
		let currentItem = boardItems[boardItemIndex];
		
		let name = currentItem.name
		let arrName = name.split(" ", 2)
		let arrEmails = [];
		let arrPhoneNumber = [];
		let arrNotes = [];
		let itemID = '';
		
		if(doConfig == true)
		{
			let columnIdConfig = [];
			if (!(fs.existsSync("./config.json"))) 
			{
				while(columnValuesIndex < currentItem.column_values.length)
				{
					let currentColumn = currentItem.column_values[columnValuesIndex]
					let columnId = currentColumn.id;
					
					if(boardItemIndex == 0 && (process.env.WORK_PHONE_TITLE === currentColumn.title || process.env.MOBILE_PHONE_TITLE === currentColumn.title || process.env.EMAIL_PRIMARY_TITLE === currentColumn.title || process.env.EMAIL_SECONDARY_TITLE === currentColumn.title || process.env.NOTES_TITLE === currentColumn.title))
					{
						let obj = {
							id: columnId,
							title: currentColumn.title
						};
						
						columnIdConfig.push(obj);
						console.log(currentColumn.title + ' ' + currentColumn.id);
					}
					columnValuesIndex++;
				}
				let config = {"columnIds" : columnIdConfig,
							"settings":
								{
									"createNewDatabase": false
								}
				};
				await setConfigVariables(config)
				fs.writeFile("./config.json", JSON.stringify(config), (err) => {
                if (err) return err;
                console.log('config stored to ./config.json');
				});
            }
			else
			{
				let config = await fs.readFileSync("./config.json");
				config = await JSON.parse(config); 
				while(columnValuesIndex < currentItem.column_values.length)
				{
					let currentColumn = currentItem.column_values[columnValuesIndex]
					let columnId = currentColumn.id;
				
					if(boardItemIndex == 0 && (process.env.WORK_PHONE_TITLE === currentColumn.title || process.env.MOBILE_PHONE_TITLE === currentColumn.title || process.env.EMAIL_PRIMARY_TITLE === currentColumn.title || process.env.EMAIL_SECONDARY_TITLE === currentColumn.title || process.env.NOTES_TITLE === currentColumn.title))
					{
						let obj = {id: columnId,
								title : currentColumn.title};
							
						columnIdConfig.push(obj);				
						console.log(currentColumn.title + ' ' + currentColumn.id);
					}
					columnValuesIndex++;
				}
				
				config.columnIds = columnIdConfig;
				config.settings.createNewDatabase = false;
				
				await setConfigVariables(config)
	
				fs.writeFile("./config.json", JSON.stringify(config), (err) => {
                if (err) return err;
                console.log('config.json updated');
				});
			}
			doConfig = false;
		}
		else
		{
			while(columnValuesIndex < currentItem.column_values.length)
			{			
				let currentColumn = currentItem.column_values[columnValuesIndex]
				let columnId = currentColumn.id
				
				switch(columnId)
				{
					case configVariables.primaryEmailID:		//Primary Email
						arrEmails.push({value: currentColumn.text, type: 'work', formattedType: 'Work' });
						break;
					case configVariables.secondaryEmailID:		//Secondary Email
						arrEmails.push({value: currentColumn.text, type: 'other', formattedType: 'Other' });
						break;
					case configVariables.workPhoneId:		//Work Phone
						var number = currentColumn.text;
						if(number.length == 10)
						{
							number = '1 (' + number.slice(0,3) + ') ' + number.substring(3,6) + '-' + number.substring(6,10);
						}
						arrPhoneNumber.push({value: number, type: 'work', formattedType: 'Work' });
						break;
					case configVariables.mobilePhoneID:		//Mobile Phone
						var number = currentColumn.text;
						if(number.length == 10)
						{
							number = '1 (' + number.slice(0,3) + ') ' + number.substring(3,6) + '-' + number.substring(6,10);
						}
						arrPhoneNumber.push({value: number, type: 'mobile', formattedType: 'Mobile' });
						break;
					case configVariables.notesID:		//Notes
						arrNotes.push({value: currentColumn.text, contentType: 'TEXT_PLAIN' });
						break;
					case 'item_id':
						itemID = currentColumn.text;
						break;
				}
				columnValuesIndex++;
			}
			
			itemMapping = await contactMappingService.getContactMapping(itemID);   //As an example.
			if(itemMapping == null)
			{
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
					if (err) return 'The API returned an error: ' + err;
					await contactMappingService.createContactMapping({
						itemID,
						resourceName: res.data.resourceName,
						etag: res.data.etag
					});
				}
				);
			}
			else
			{
				await service.people.updateContact({
					resourceName: itemMapping.dataValues.resourceName,
					sources: 'READ_SOURCE_TYPE_CONTACT',
					updatePersonFields: 'biographies,emailAddresses,names,phoneNumbers',
					requestBody: {
						etag: itemMapping.dataValues.etag,	
						names: [
							{
								givenName: arrName[0],
								familyName: arrName[1],
							},
						],
						emailAddresses:arrEmails,
						phoneNumbers:  arrPhoneNumber,
						biographies: arrNotes,
					} 
				}, async (err, res) => { 
						if (err) return console.error('The API returned an error: ' + err);
						await contactMappingService.updateContactMapping(itemID,{resourceName: res.data.resourceName, etag: res.data.etag});	
					} 
				);
			}
			boardItemIndex++;
		}
	}
	return null;
}

module.exports = {
	makeNewContact,
	populateContacts
};