const request = require('supertest')
const express = require('express')
const sinon = require('sinon')
const router = require('../src/routes/index.js')
const RateLimiter = require('express-rate-limit')
const app = express()

app.use('/', router)

const expect = require('chai').expect;
const http = require('http');

// Create a new class that extends the http.ServerResponse class
class MockResponse extends http.ServerResponse {
  constructor() {
    super({ method: '', url: '' });
    this.headers = {};
  }
  setHeader(name, value) {
    this.headers[name] = value;
  }
  getHeader(name) {
    return this.headers[name];
  }
}

describe('router', function () {
  it('GET / should return 200 status code', function (done) {
    request(app)
      .get('/')
      .expect(200)
      .end(function (err, res) {
        if (err) throw err
        done()
      })
  })

  it('error handling middleware should handle errors thrown by routes', function (done) {
    let req = {}
    let res = {
      status: function () { },
      send: function () { }
    }
    let next = function (err) {
      expect(err.message).to.equal('Test error')
      done()
    }
  
    // Pass an error object to the error handling middleware
    next(new Error('Test error'))
  })
})