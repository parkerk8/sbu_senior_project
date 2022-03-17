const express = require('express');
const router = express.Router();
 

const auth1 = require('../OAuth/googleAuth.js').setUpOAuth;   
const auth2 = require('../OAuth/googleAuth.js').codeHanlde;
const help = require('../OAuth/googleAuth.js').helpME;


const OAuthRequestAuthenticationMiddleware = require('../middleware/auth-request').authOAuthSetUp;
//get the required functions to use.


router.get('/gone', help);
router.get('/auth', OAuthRequestAuthenticationMiddleware, auth1);
router.get('/tokenHandle', auth2);

module.exports = router;