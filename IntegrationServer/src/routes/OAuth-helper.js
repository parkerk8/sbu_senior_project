const express = require('express');
const router = express.Router();

const { setUpOAuth, codeHandle } = require('../OAuth/google-auth.js');
const { authRequestMiddleware } = require('../middleware/auth-request');

router.get('/auth', authRequestMiddleware, setUpOAuth);
router.get('/tokenHandle', codeHandle);

module.exports = router;
