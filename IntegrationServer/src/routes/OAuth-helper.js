const express = require('express');
const router = express.Router();
 

const hanleAuth = require('../OAuth/google-auth.js').setUpOAuth;   
const generateToken = require('../OAuth/google-auth.js').codeHandle;
const AuthenticationMiddleware = require('../middleware/auth-request').authRequestMiddleware;
//get the required functions to use.
console.log("I made it to OAuth-helper.js routes");

router.get('/auth', AuthenticationMiddleware, hanleAuth);
router.get('/tokenHandle', generateToken);

module.exports = router;