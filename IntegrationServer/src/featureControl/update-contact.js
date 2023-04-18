const { google } = require('googleapis');
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient;

google.options({auth: OAuth2Client});

const service = google.people({version: 'v1', auth: OAuth2Client});

const contactMappingService = require('../services/database-services/contact-mapping-service');

const { configVariables } = require('../config/config-helper.js');

/**
 * It takes the data from the webhook, formats it, and then sends it to the update function.
 * @param req - The request object
 * @param res - the response object
 * @returns a promise.
 */
async function updateContactInfo(req, res) {
	const { inboundFieldValues } = req.body.payload;
  const itemMap = inboundFieldValues.itemMapping;
  const changedColumnId = inboundFieldValues.columnId;
  const itemID = JSON.stringify(inboundFieldValues.itemId);

	console.log(JSON.stringify(inboundFieldValues));

	const {
    primaryEmailID,
    secondaryEmailID,
    workPhoneID,
    mobilePhoneID,
    notesID,
  } = configVariables;

  if ([primaryEmailID, secondaryEmailID, workPhoneID, mobilePhoneID, notesID].includes(changedColumnId)) {
		try { //Try triggering an update with payload information
			await updateExisting(itemID, itemMap, updateExisting);
      return res.status(200).send({})
		} catch(err) { //Error
			console.log("Catch block1 err: " + err);
		}
		return res.status(409).send({});
	} else { //Column not a synced title
		console.log("no change on update");
		return res.status(200).send({});
	}
}


/**
 * When called, will push information for the titles located in the env are for the specified item 
 * @param itemID - specifies the item that has been changed
 * @param itemMap - contains the information to update object - req payload from monday.com
 * @param [callback] - what function to call in case of failure
 *        // TODO: CHECK callback param: is this something to replace with a const variable due to possible security concerns?
 */
async function updateExisting (itemID, itemMap) { // updates existing database.
  console.log('I made it to updateExisting')

  const name = itemMap.name
  const nameArr = await nameSplit(name)
  let { arrEmails, arrPhoneNumbers, arrNotes } = await formatColumnValues(itemMap, configVariables)
  let itemMapping = await contactMappingService.getContactMapping(itemID)

  console.log("Emails: ", arrEmails)
  console.log("Phones: ", arrPhoneNumbers)
  console.log("Notes: ", arrNotes)

  service.people.get({
    resourceName: itemMapping.dataValues.resourceName,
    personFields: 'metadata'
  }, async (err, res) => {
    if (err) return console.error('The API returned an error at update1: ' + err)
    else {
      let updatedMapping = await contactMappingService.getContactMapping(itemID)
      console.log("outer service")

      //THIS IS BROKEN ATM - PUSH WIPES ALL INFORMATION INSTEAD; SEE sync-contacts.js
      //FOR THE UPDATE CASE IN FUNCTION updateExistingContact FOR COMPARISON
      await service.people.updateContact({
        resourceName: updatedMapping.dataValues.resourceName,
        sources: 'READ_SOURCE_TYPE_CONTACT',
        updatePersonFields: 'biographies,emailAddresses,names,phoneNumbers',
        requestBody: {
          etag: updatedMapping.dataValues.etag,
          names: [
            {
              displayName: name,
              givenName: nameArr[0],
              middleName: nameArr[1],
              familyName: nameArr[2],
            }
          ],
          emailAddresses: arrEmails,
          phoneNumbers: arrPhoneNumbers,
          biographies: arrNotes
        }
      }, async (err, res) => {
        if (err) console.error('The API returned an error at update2: ' + err)
        else {
          console.log("inner update service")
          await contactMappingService.updateContactMapping(itemID, { resourceName: res.data.resourceName, etag: res.data.etag })
        }
      })//end inner service
    }
  }) //end outer service
  return null
}

////FUNCTIONS////

/*
 * Splits the contact into an array to seperate first, middle, last
 * If there is only a first the other values will be undifined which the api call can handle
 * THIS IS A RUDIMENTARY NAME SPLIT - THERE ARE BETTER WAYS OF DOING THIS.
 * @params name - string with the full name to be split.
 * @returns nameArr - array of the name post-split
 */
async function nameSplit(name) {
    let nameArr = await name.split(" ");

  //If there is no middle, the last name needs to be assigned to nameArr[2] for the api call
  switch (nameArr.length == 2) {
    case 1 :
        nameArr[1]= "";
        nameArr[2]= "";
        break;
    case 2 :
        nameArr[2] = nameArr[1];
        nameArr[1] = "";
        break;
    case 3 :
      break;
  }
  return nameArr;
}

async function phoneFormat(phone) {
	//Try to format mobile and work phones 
	if(phone != undefined) {
		if(phone.length == 10) {
			phone = await '1 ('+ phone.slice(0,3) + ') ' +  phone.substring(3,6) + '-' + phone.substring(6,10);
		}
	}
  return phone;
}

async function formatColumnValues (itemMap) {
  const {
    primaryEmailID,
    secondaryEmailID,
    workPhoneID,
    mobilePhoneID,
    notesID,
  } = configVariables;
  let workPhone = await phoneFormat(itemMap[workPhoneID]);
  let mobilePhone = await phoneFormat(itemMap[mobilePhoneID]);
  const primaryEmail = itemMap[primaryEmailID];
  const secondaryEmail = itemMap[secondaryEmailID];
  const notes = itemMap[notesID];

  let arrEmails= []
  let arrPhoneNumbers=[]
  let arrNotes = []

  arrEmails.push({ value: primaryEmail, type: 'work', formattedType: 'Work' })
  arrEmails.push({ value: secondaryEmail, type: 'other', formattedType: 'Other' })
  arrPhoneNumbers.push({ value: workPhone, type: 'work', formattedType: 'Work' })
  arrPhoneNumbers.push({ value: mobilePhone, type: 'mobile', formattedType: 'Mobile' })
  arrNotes.push({ value: notes, contentType: 'TEXT_PLAIN' })

  console.log("Emails: ", arrEmails)
  console.log("Phones: ", arrPhoneNumbers)
  console.log("Notes: ", arrNotes)

  return {
    arrEmails,
    arrPhoneNumbers,
    arrNotes,
  }
}

module.exports = {
	updateContactInfo,
};
