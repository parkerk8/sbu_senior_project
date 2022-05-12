const {google} = require('googleapis');
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient
google.options({auth: OAuth2Client});


const service = google.people( {version: 'v1', auth: OAuth2Client});

const contactMappingService = require('../services/database-services/contact-mapping-service');

const {getBoardItems} = require('../services/monday-service.js');
const fs = require('fs');

/* Import the configVariables from the config-helper.js file. */
var {configVariables} = require('../config/config-helper.js');
const setConfigVariables = require('../config/config-helper.js').setConfigVariables;




var populateLock = true; 
//Monday will send a duplicate request if it doesn't get a response in 30 seconds.
//This is very much an issue with the populate function, which takes far longer than that to execute.
//This lock varibale is used to prevent multiple sync requests happening simultaniusly 


/**
 * It takes the board items from the board that the user selected, and then it either creates a new
 * database of contacts or syncs with an existing database of contacts
 * @param req - The request object
 * @param res - The response object
 */
async function populateContacts(req, res)
{
	const boardItems = await getBoardItems(req.session.shortLivedToken, req.body.payload.inputFields.boardID)
	let {createNewDatabase} = configVariables;
	console.log("Create new database = " + createNewDatabase);
	
	if(populateLock) //Doing it like this is very hacky, find a better way if possible. It does, however, work. So, for now we leave it.
	{
		populateLock = false;
		if(createNewDatabase === true)
		{
			let err = await initalSetupGoogleContacts(boardItems);
			populateLock = true;
			if(err)
			{
				console.error(err);
			}
			console.log("Sync finished");
			return res.status(200).send({});
		}
		else if(createNewDatabase === false)
		{
			let err = await syncWithExistingContacts(boardItems)
			populateLock = true;
			if(err)
			{
				console.error(err);
			}
			console.log("Sync finished");
			return res.status(200).send({});
		}
		else
		{
			populateLock = true;
			console.error("Error, config variables corrupt");
			return res.status(500).json({ error: 'Internal Server Error' });
		}
	}
	else
	{
		console.log("Stop, only one sync allowed at once");
		return res.status(200).send({});
	}
}

//Name
//Role -> Job Title
//Entity -> Company
//Emails
//Phones    //Don't worry about extentions 
//Notes

//Query for etag on update fail.


/**
 * It takes a list of contacts from a database, and creates a new database with the same contacts.
 * @param boardItems - an array of objects that contain the information for each contact.
 * @returns null.
 */
async function initalSetupGoogleContacts(boardItems){   //makes new database.
	let boardItemIndex = 0;
	let doConfig = true;
	
	await contactMappingService.deleteDatabse();
	console.log(boardItems.length);
	
	while(boardItemIndex < boardItems.length)
	{

		if((boardItemIndex + 1) % 27 == 0)
		{
			await sleep(20000);
		}

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
				if (err) console.error('The API returned an error: ' + err);
				else{
				await contactMappingService.createContactMapping({
					itemID,
					resourceName: res.data.resourceName,
					etag: res.data.etag
				});
				}
			}
			);
			boardItemIndex++;
		}
	}
	return null;
}

/**
 * Takes in an array of objects, each object representing a row in the board, and updates the
 * contacts in the database with the information contained in the board
 * @param boardItems - An array of objects that contain the data from the board.
 * @returns null.
 */
async function syncWithExistingContacts(boardItems){   //updates existing database.
	let boardItemIndex = 0;
	let doConfig = true;
	
	while(boardItemIndex < boardItems.length)
	{
		if((boardItemIndex + 1) % 14 == 0)
		{
			await sleep(20000);
		}
		
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
			
			itemMapping = await contactMappingService.getContactMapping(itemID);
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
					if (err) console.error('The API returned an error: hi' + err);
					else{
						await contactMappingService.createContactMapping({
							itemID,
							resourceName: res.data.resourceName,
							etag: res.data.etag
						});
					}
				}
				);
			}
			else
			{
				service.people.get({
					resourceName: itemMapping.dataValues.resourceName,
					personFields: 'metadata',
				}, async (err, res) => {
					if(err) return console.error('The API returned an error: ' + err);
					else{
					update = await contactMappingService.updateContactMapping(itemID, {resourceName: res.data.resourceName, etag: res.data.etag});
					updatedMapping = itemMapping = await contactMappingService.getContactMapping(itemID);
				
					await service.people.updateContact({
						resourceName: updatedMapping.dataValues.resourceName,
						sources: 'READ_SOURCE_TYPE_CONTACT',
						updatePersonFields: 'biographies,emailAddresses,names,phoneNumbers',
						requestBody: {
							etag: updatedMapping.dataValues.etag,	
							names: [
								{
									givenName: arrName[0],
									familyName: arrName[1],
								},
							],
							emailAddresses:arrEmails,
							phoneNumbers: arrPhoneNumber,
							biographies: arrNotes,
						} 
					}, async (err, res) => { 
							if (err) console.error('The API returned an error: ' + err);
							else{
								await contactMappingService.updateContactMapping(itemID,{resourceName: res.data.resourceName, etag: res.data.etag});	
							}
						} 
					);
					}
				});
			}
			boardItemIndex++;
		}
	}
	return null;
}

/**
 * This function will wait for a specified amount of time before continuing with the next line of code.
 * @param ms - The number of milliseconds to wait before resolving the promise.
 * @returns A promise object.
 */
function sleep(ms) {
	console.log("Please wait warmly, APIs are resting");
	return new Promise((resolve) => {
		setTimeout(resolve, ms);
	});
}

module.exports = {
	populateContacts
};