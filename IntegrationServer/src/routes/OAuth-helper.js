const express = require('express')
const router = express.Router()
const rateLimit = require('express-rate-limit')

const { setUpOAuth, codeHandle } = require('../OAuth/google-auth.js')
const { authRequestMiddleware } = require('../middleware/auth-request')

// Set up rate limiting options
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})

// Apply rate limiting to the router
router.use(limiter)

router.get('/auth', authRequestMiddleware, setUpOAuth)
router.get('/tokenHandle', codeHandle)

module.exports = router
