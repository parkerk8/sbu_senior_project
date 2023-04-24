const { google } = require('googleapis');
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient
google.options({auth: OAuth2Client});

const service = google.people( {version: 'v1', auth: OAuth2Client});

const contactMappingService = require('../services/database-services/contact-mapping-service');

const { configVariables } = require('../config/config-helper.js');

const { createContactService } = require('../services/google-services/create-service.js') //API handler for creating and updating contacts

const { formatColumnValues, nameSplit } = require('../util/contact-parser.js') //Information parser


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

/*
 * When called, will push information for the titles located in the env with specified item information
 * @param itemID - specifies the item that has been changed
 * @param itemMap - contains the information to update object - req payload from monday.com
 * @param [callback] - what function to call in case of failure
 *        // TODO: CHECK callback param: is this something to replace with a const variable due to possible security concerns?
 */
async function makeContact(itemID, itemMap) {

  //Get info
  const name = itemMap.name;
  let nameArr = await nameSplit(name);
  let { arrEmails, arrPhoneNumbers, arrNotes } = await formatColumnValues(itemMap, configVariables)

  //Request Creation
  try {
    await createContactService (name, nameArr, arrEmails, arrPhoneNumbers, arrNotes, itemID)
  } catch(error) {
    return error
  }
  
  return 0;
}

module.exports = {
  makeNewContact
};