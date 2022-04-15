const express = require('express');
const router = express.Router();

const authenticationMiddleware = require('../middleware/auth-request').authRequestMiddleware;
const {populateContacts} = require('../featureControl/makeContact.js');

router.post('/populate', authenticationMiddleware, populateContacts);


module.exports = router;