const express = require('express');
const router = express.Router();
const Mutex = require('async-mutex').Mutex;

const { makeContact, updateContact, populateContacts } = require('../featureControl');
const { authRequestMiddleware } = require('../middleware');

const mutex = new Mutex();

router.use(authRequestMiddleware);

//get the required functions to use. 
//when a post request is sent to /create, then first run it threw the authentication, then if that passes, move it on into the actual function. 
router.post('/create', async (req, res) => {
  const release = await mutex.require();
  try {
    await makeContact (req, res);
  } catch (err) {
    console.error('Error creating contact:', err);
    res.status(500).send('Error creating contact');
  } finally {
    release ();
  }
});

//when a post request is sent to /update, then first run it threw the authentication, then if that passes, move it on into the actual function. 
router.post('/update', async (req, res) => {
  const release = await mutex.acquire();
  try {
    await updateContact(req, res);
  } catch (err) {
    console.error('Error updating contacts:', err);
    res.status(500).send('Error updating contacts');
  } finally {
    release();
  }
});

router.post('/sync', async (req, res) => {
  const release = await mutex.acquire();
  try {
    await populateContacts(req, res);
  } catch (err) {
    console.error('Error syncing contacts:', err);
    res.status(500).send('Error syncing contacts');
  } finally {
    release();
  }
});

//when a post request is sent to /print, then first run it threw the authentication, then if that passes, move it on into the actual function. 
router.post('/print', async (req, res) => {
  const release = await mutex.acquire();
  try {
    console.log(req.body);
    console.log('printRequest', JSON.stringify(req.body));
    res.status(200).send({});
  } catch (err) {
    console.error('Error printing:', err);
    res.status(500).send('Error printing');
  } finally {
    release();
  }
});

module.exports = router;
