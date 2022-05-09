const express = require('express');
const router = express.Router();
 

const hanleAuth = require('../OAuth/google-auth.js').setUpOAuth;   
const generateToken = require('../OAuth/google-auth.js').codeHanlde;
const OAuthRequestAuthenticationMiddleware = require('../middleware/auth-request').authOAuthSetUp;

const testingFunction = require('../OAuth/googleAuth.js').helpME;
//get the required functions to use.


router.get('/gone', testingFunction); //For testing purposes. Remove in final release or else. It's at /gone because it's a fun word and it's easy to remember.
router.get('/auth', OAuthRequestAuthenticationMiddleware, hanleAuth);
router.get('/tokenHandle', generateToken);

module.exports = router;