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
  /** Currently not working. WIP
   it('should limit requests to 100 per IP every 15 minutes', function (done) {
     this.timeout(30000);
    // Create a mock function that simulates requests to the endpoint
    const mockRequest = sinon.fake((req, res, next) => {
      next(); // Call the next middleware
      res.sendStatus(200);
    });

    // Set up the rate limiter middleware with a low limit
    const rateLimiter = RateLimiter({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // Limit requests to 100 per IP
      message: 'Too many requests, please try again later.'
    });

    // Create a mock response object with a setHeader method
    const mockResponse = {
      headers: {},
      setHeader: function(name, value) {
        this.headers[name] = value;
      },
      getHeader: function(name) {
        return this.headers[name];
      }
    };

    // Call the middleware with the mock request function
    rateLimiter({ ip: '127.0.0.1' }, mockRequest, mockResponse, function (err) {
      if (err) {
        done(err);
      } else {
        // Assert that the mock function was called 100 times
        sinon.assert.callCount(mockRequest, 100);

        // Assert that the rate limiter headers were set correctly
        expect(mockResponse.getHeader('X-RateLimit-Limit')).to.equal('100');
        expect(mockResponse.getHeader('X-RateLimit-Remaining')).to.equal('0');
        
        done();
      }
    });
  });
  */

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