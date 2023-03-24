const express = require('express');
const router = express.Router();
const rateLimit = require('express-rate-limit');

const { setUpOAuth, codeHandle } = require('../OAuth/google-auth');
const { authRequestMiddleware } = require('../middleware/auth-request');
const { errorHandler } = require('../middleware/error-handler');

const WINDOWS_MS = 15 * 60 * 1000; // 15 minutes

// Set up rate limiting options
const limiter = rateLimit({
  windowMs: WINDOWS_MS, // 15 minutes
  max: process.env.RATE_LIMIT_MAX // limit each IP to a configurable number of requests per windowMs
});

// Apply limiter to the router
router.use(limiter);

// Set up routes
router.get('/auth', authRequestMiddleware, setUpOAuth);
router.get('/tokenHandle', authRequestMiddleware, codeHandle);

// Apply error handling middleware to the router
router.use(errorHandler);

module.exports = router;
