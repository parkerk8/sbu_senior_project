const { google } = require('googleapis')
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient
google.options({ auth: OAuth2Client })

const service = google.people({ version: 'v1', auth: OAuth2Client })

const contactMappingService = require('../services/database-services/contact-mapping-service')

const { configVariables } = require('../config/config-helper.js') // Object which setconfigVariables fills in the ID for the elements with a matching column found in the .env's title element. Includes a "createNewDatabase" element within it.

console.log('I made it to make-contact.js')
async function makeNewContact (req, res) {
  // gets the contact info from monday.com
  console.log('I made it to make-contact.js')
  const itemMap = req.body.payload.inboundFieldValues.itemMapping
  const itemID = JSON.stringify(req.body.payload.inboundFieldValues.itemId)

  const itemMapping = await contactMappingService.getContactMapping(itemID) // Sequilize database. Tries to get itemMapping with the same itemID if it exists for error-handling

  if (itemMapping != null) { // if this occurs, there is either an old database-entry with the same itemID somehow, create was called twice, or the itemIDs are repeating.
    console.log('Mapping already exists: aborting make contact')
    return res.status(409).send({}) // 409 status error: Conflict - see above if statement comment at the if for reason.
  } else {
  	const name = itemMap.name // Get name and the IDs of the Title Fields that exist from contactMappingService
  	const primaryEmail = itemMap[configVariables.primaryEmailID]
  	const secondaryEmail = itemMap[configVariables.secondaryEmailID]
  	let workPhone = itemMap[configVariables.workPhoneId]
  	let mobilePhone = itemMap[configVariables.mobilePhoneID]
  	const notes = itemMap[configVariables.notesID]

  	// Splits the contact into an array to seperate first name from middle and/or last name - IF they exist - via splitting the name column on any spaces that exist.
    // DOES NOT AFFECT THE MAIN DISPLAY NAME WHILE VIEWING CONTACT LIST
  	const nameArr = await name.split(' ', 2) // Possible Issues: first or last names with spaces in them, or a name with more than 3 parts.

  	/* if (nameArr.length == 2) {
  		nameArr[2] = nameArr[1];
  		nameArr[1] = "";
  	} */

  	// Reformat phone number to be a bit nicer if input is regular number-string: "xxx xxx xxxx" (no spaces) =into=> "1 (xxx) xxx-xxxx" (with spaces)
  	if ((workPhone !== undefined) && (workPhone.length === 10)) { // Reformat work phone number
  		console.log('Reformat work-phone: ' + workPhone)
  		workPhone = await '1 (' + workPhone.slice(0, 3) + ') ' + workPhone.substring(3, 6) + '-' + workPhone.substring(6, 10)
  	}
  	if ((mobilePhone !== undefined) && (mobilePhone.length === 10)) { // Reformat mobile phone number
  		console.log('Reformat mobile-phone: ' + mobilePhone)
  		mobilePhone = await '1 (' + mobilePhone.slice(0, 3) + ') ' + mobilePhone.substring(3, 6) + '-' + mobilePhone.substring(6, 10)
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
  	// calls the people api to create a contact with any information that has been put into the new contact. Normally should just be the name
  	await service.people.createContact({
  		requestBody: {
  			names: [
  				{
  					displayName: name,
  					familyName: nameArr[2],
  					givenName: nameArr[0],
  					middleName: nameArr[1]
  				}
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
  				}
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
  				}
  			],
  			biographies: [
  				{
  					value: notes,
  					contentType: 'TEXT_PLAIN'
  				}
  			]
  		}
  	}, async (err, res) => {
  			if (err) return console.error('The API returned an error: ' + err)
  			await contactMappingService.createContactMapping({
  				itemID,
  				resourceName: res.data.resourceName,
  				etag: res.data.etag
  			})
  		}
  	)
  	return res.status(200).send({})
  }
};

module.exports = {
  makeNewContact
}
