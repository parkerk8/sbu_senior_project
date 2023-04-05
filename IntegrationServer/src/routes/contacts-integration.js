const express = require('express')
const rateLimit = require('express-rate-limit')
const Mutex = require('async-mutex').Mutex

// Importing functions to handle creating, syncing, and updating contacts
const { makeNewContact } = require('../featureControl/make-contact.js')
const { fetchContacts } = require('../featureControl/sync-contacts.js')
const { updateExistingContact } = require('../featureControl/update-contact.js')

// Importing middleware to handle authentication requests and errors
const { authRequestMiddleware } = require('../middleware/auth-request')
const { errorHandler } = require('../middleware/error-handler')

// Set rate limiter values (100 requests per IP every 15 minutes)
const WINDOWS_MS = 15 * 60 * 1000 // 15 minutes

// Create rate limiter and mutex instances
const limiter = rateLimit({
  windowMs: WINDOWS_MS,
  max: process.env.RATE_LIMIT_MAX // Limit each IP to 100 requests per windowMs
})

// Function that applies a mutex to a given route handler
const withMutex = (fn) => async (req, res, next) => {
  const release = await mutex.acquire()
  try {
    await fn(req, res, next)
  } catch (err) {
    console.error(`Error processing ${fn.name}:`, err)
    next(err)
  } finally {
    release()
  }
}

const mutex = new Mutex()

// Router instance
const router = express.Router()

// Use middleware on all routes
router.use(limiter)

// Route handlers with mutex for handling concurrent requests
router.post('/create', authRequestMiddleware, withMutex(makeNewContact))
router.post('/update', authRequestMiddleware, withMutex(updateExistingContact))
router.post('/sync', authRequestMiddleware, withMutex(fetchContacts))
router.post('/print', withMutex(async (req, res) => {
  console.log(req.body)
  console.log('printRequest', JSON.stringify(req.body))
  res.status(200).send({})
}))

// Middleware for handling errors
router.use(errorHandler)

// Exporting the router to be used by the main server file.
module.exports = router
