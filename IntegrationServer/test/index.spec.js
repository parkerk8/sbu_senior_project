const expect = require('chai').expect;
const request = require('supertest');
const router = require('../src/routes/index.js');
const app = require('../src/server.js');

describe('index route', function() {
  
  beforeEach(function() {
    app.use(router);
  });

  it('should return a 200 response for /contacts-integration route', function(done) {
    request(app)
      .get('/contacts-integration')
      .expect(200, done);
  });

  it('should return a JSON response for /contacts-integration route', function(done) {
    request(app)
      .get('/contacts-integration')
      .expect('Content-Type', "text/html; charset=utf-8")
      .end(function(err, res) {
        if (err) return done(err);
        expect(res.body).to.be.an('object');
        done();
      });
  });

  it('should return a 429 response for too many requests', function(done) {
    // Assume that rateLimiterUsingThirdParty middleware is working properly
    // and limiting requests to 1 per second
    request(app)
      .get('/contacts-integration')
      .expect(200)
      .end(function(err, res) {
        if (err) return done(err);
        request(app)
          .get('/contacts-integration')
          .expect(429, done);
      });
  });
});