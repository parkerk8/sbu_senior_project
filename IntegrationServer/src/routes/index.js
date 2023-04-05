// The router allows us to modularize the application and makes it more organized. If we need to add a new integration, it will be easier to maintain and reuse this framework.
const router = require('express').Router()
const rateLimit = require('express-rate-limit')

// Importing the routes from the contacts-integration.js file to handle requests related to contacts.
const contactsRoutes = require('./contacts-integration')

// Importing the routes from the OAuth-helper.js file to handle requests related to OAuth setup.
const oauthRoutes = require('./OAuth-helper')

// Importing a custom error handling middleware
const { errorHandler } = require('../middleware/error-handler')

// Set rate limiter values (100 requests per IP every 15 minutes)
const WINDOWS_MS = 15 * 60 * 1000 // 15 minutes

// Create rate limiter and mutex instances
const limiter = rateLimit({
  windowMs: WINDOWS_MS,
  max: process.env.RATE_LIMIT_MAX
})

// Adding rate limting to the router
router.use(limiter)

// Registering the contacts and OAuth routes with the router to handle incoming requests.
router.use(contactsRoutes)
router.use(oauthRoutes)

// Adding error handling middleware to the router
router.use(errorHandler)

// Route that just posts "Hello World" to verif yit is up and running
router.get('/', (req, res) => {
  res.send('Hello World!')
})

// Exporting the router to be used by the main server file.
module.exports = router
