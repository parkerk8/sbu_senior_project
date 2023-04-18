const { google } = require('googleapis');
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient
google.options({auth: OAuth2Client});

const service = google.people( {version: 'v1', auth: OAuth2Client});

const contactMappingService = require('../services/database-services/contact-mapping-service');

const { configVariables } = require('../config/config-helper.js');

const { createContactService } = require('../services/google-services/create-service.js')


async function makeNewContact(req, res) {
  try {
    //gets the contact info from monday.com
    const itemMap = req.body.payload.inboundFieldValues.itemMapping;
    const itemID = JSON.stringify(req.body.payload.inboundFieldValues.itemId);

    //Sequilize database. Tries to get itemMapping with the same itemID if it exists for error-handling
    const itemMapping = await contactMappingService.getContactMapping(itemID);

    if (itemMapping != null) { //Check if item with the given ID alreaady exists
      console.log("Mapping already exists: aborting make contact");
      return res.status(200).send({});
      //if this occurs, there is either an old database-entry with the same itemID somehow. e.g. create was called twice, or the itemIDs are repeating.
    } else { //No contact exists
      const contactRes = makeContact(itemID, itemMap);

      return res.status(200).send({});
    }
  } catch (error) {
    console.error('An error occurred:', error);
    return res.status(500).send({});
  }
};


////FUNCTIONS////
//Rudimentary splitter for names using spaces - missing case for more than 3 spaces.
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

async function makeContact(itemID, itemMap) {
  // Get name and the IDs of the Title Fields that exist from contactMappingService
  const {
    primaryEmailID,
    secondaryEmailID,
    workPhoneID,
    mobilePhoneID,
    notesID,
  } = configVariables;
  const name = itemMap.name;
  let nameArr = await nameSplit(name);
  let { arrEmails, arrPhoneNumbers, arrNotes } = await formatColumnValues(itemMap, configVariables)

  console.log("Emails: ", arrEmails)
  console.log("Phones: ", arrPhoneNumbers)
  console.log("Notes: ", arrNotes)
  
  await createContactService (name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID)
  
  return 0;
}

/*
//WIP - No implemented.
//Intended for in case functionality with createMappingService is split from the createContact case for readability reasons.
async function newMapping(itemID, resourceName, etag) {
  await contactMappingService.createContactMapping({
    itemID,
    resourceName: resourceName, 
    etag: etag
  });
}
*/


module.exports = {
  makeNewContact
};

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