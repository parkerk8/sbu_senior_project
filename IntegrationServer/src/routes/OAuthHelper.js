const express = require('express');
const router = express.Router();
 

const auth1 = require('../OAuth/googleAuth.js').setUpOAuth;   
const auth2 = require('../OAuth/googleAuth.js').codeHanlde;
const OAuthRequestAuthenticationMiddleware = require('../middleware/auth-request').authOAuthSetUp;

const testingFunction = require('../OAuth/googleAuth.js').helpME;
//get the required functions to use.


router.get('/gone', testingFunction); //For testing purposes. Remove in final release or else. It's at /gone because it's a fun word and it's easy to remember.
router.get('/auth', OAuthRequestAuthenticationMiddleware, auth1);
router.get('/tokenHandle', auth2);

module.exports = router;