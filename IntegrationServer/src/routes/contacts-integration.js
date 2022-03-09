const express = require('express');
const router = express.Router();

const makeContact = require('../featureControl/makeContact.js').makeNewContact;   
const updateContact = require('../featureControl/updateContact.js').updateContactInfo;
const authenticationMiddleware = require('../middleware/auth-request').authRequestMiddleware;
//get the required functions to use. 

//when a post request is sent to /create, then first run it threw the authentication, then if that passes, move it on into the actual function. 
router.post('/create', authenticationMiddleware, makeContact);

//when a post request is sent to /update, then first run it threw the authentication, then if that passes, move it on into the actual function. 
router.post('/update', authenticationMiddleware, updateContact);


//when a post request is sent to /print, then first run it threw the authentication, then if that passes, move it on into the actual function. 
router.post('/print', authenticationMiddleware,function (req, res) {
	console.log(req.body);
  console.log('printRequest', JSON.stringify(req.body));
  return res.status(200).send({});
});

module.exports = router;