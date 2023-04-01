const assert = require('chai').assert;
const sinon = require('sinon');
const contactsIntegraiton = require('../src/routes/contacts-integration.js');

const request = require('supertest');
const app = require('../src/server.js');
const { expect } = require('chai');

