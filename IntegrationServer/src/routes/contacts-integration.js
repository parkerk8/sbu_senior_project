const express = require('express');
const router = express.Router();

const makeContact = require('../featureControl/make-contact.js').makeNewContact;   
const updateContact = require('../featureControl/update-contact.js').updateContactInfo;
const authenticationMiddleware = require('../middleware/auth-request').authRequestMiddleware;
const {populateContacts} = require('../featureControl/sync-contacts.js');
//get the required functions to use. 

//when a post request is sent to /create, then first run it threw the authentication, then if that passes, move it on into the actual function. 
router.post('/create', authenticationMiddleware, makeContact);

//when a post request is sent to /update, then first run it threw the authentication, then if that passes, move it on into the actual function. 
router.post('/update', authenticationMiddleware, updateContact);



router.post('/sync', authenticationMiddleware, populateContacts);



//when a post request is sent to /print, then first run it threw the authentication, then if that passes, move it on into the actual function. 
router.post('/print', authenticationMiddleware,function (req, res) {
	console.log(req.body);
  console.log('printRequest', JSON.stringify(req.body));
  return res.status(200).send({});
});

module.exports = router;
