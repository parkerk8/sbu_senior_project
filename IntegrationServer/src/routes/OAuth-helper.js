const express = require('express');
const router = express.Router();
 

const hanleAuth = require('../OAuth/google-auth.js').setUpOAuth;   
const generateToken = require('../OAuth/google-auth.js').codeHanlde;
const AuthenticationMiddleware = require('../middleware/auth-request').authRequestMiddleware;

const testingFunction = require('../OAuth/google-auth.js').helpME;
//get the required functions to use.


router.get('/gone', testingFunction); //For testing purposes. Remove in final release or else. It's at /gone because it's a fun word and it's easy to remember.
router.get('/auth', AuthenticationMiddleware, hanleAuth);
router.get('/tokenHandle', generateToken);

module.exports = router;