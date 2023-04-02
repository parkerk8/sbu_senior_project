const {google} = require('googleapis');
const OAuth2Client = require('../OAuth/google-auth.js').OAuthClient
google.options({auth: OAuth2Client});

const service = google.people( {version: 'v1', auth: OAuth2Client});

const contactMappingService = require('../services/database-services/contact-mapping-service');

const {configVariables} = require('../config/config-helper.js');

async function makeNewContact(req, res) {
  try {
    //gets the contact info from monday.com
    const itemMap = req.body.payload.inboundFieldValues.itemMapping;
    const itemID = JSON.stringify(req.body.payload.inboundFieldValues.itemId);

    //Sequilize database. Tries to get itemMapping with the same itemID if it exists for error-handling
    const itemMapping = await contactMappingService.getContactMapping(itemID);
    // if this occurs, there is either an old database-entry with the same itemID somehow, 
    //create was called twice, or the itemIDs are repeating.
    if (itemMapping != null) {
      console.log("Mapping already exists: aborting make contact");
      return res.status(409).send({});
    } else {
      // Get name and the IDs of the Title Fields that exist from contactMappingService
      let {name, [configVariables.primaryEmailID]: primaryEmail, [configVariables.secondaryEmailID]: secondaryEmail, [configVariables.workPhoneId]: workPhone, [configVariables.mobilePhoneID]: mobilePhone, [configVariables.notesID]: notes} = itemMap;

      
      //Splits the contact into an array to seperate first name from middle and/or last name - 
       const nameArr = name.split(" ", 2);
      //IF they exist - via splitting the name column on any spaces that exist.
      //DOES NOT AFFECT THE MAIN DISPLAY NAME WHILE VIEWING CONTACT LIST
      //Possible Issues: first or last names with spaces in them, or a name with more than 3 parts.
      /*if (nameArr.length == 2) {
  		  nameArr[2] = nameArr[1];
  		  nameArr[1] = "";
  	  }*/
      //Reformat phone number to be a bit nicer if input is regular number-string: "xxx xxx xxxx" 
      if ((workPhone != undefined) && (workPhone.length == 10)) {
        console.log("Reformat work-phone: " + workPhone);
        workPhone = '1 ('+ workPhone.slice(0,3) + ') ' +  workPhone.substring(3,6) + '-' + workPhone.substring(6,10);
      }
      if ((mobilePhone != undefined) && (mobilePhone.length == 10)) {
        console.log("Reformat mobile-phone: " + mobilePhone);
        mobilePhone = '1 ('+ mobilePhone.slice(0,3) + ') ' +  mobilePhone.substring(3,6) + '-' + mobilePhone.substring(6,10);
      }
      //calls the people api to create a contact with any information that has been put into the new contact. 
      //Normally should just be the name
      const res = await service.people.createContact({
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
      });
      
      await contactMappingService.createContactMapping({
        itemID,
        resourceName: res.data.resourceName, 
        etag: res.data.etag
      });	

      return res.status(200).send({});
    }
  } catch (error) {
    console.error('An error occurred:', error);
    return res.status(500).send({});
  }
};

module.exports = {
  makeNewContact
};