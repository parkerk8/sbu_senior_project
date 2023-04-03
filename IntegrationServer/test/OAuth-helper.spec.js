const chai = require('chai');
const chaiHttp = require('chai-http');
const jwt = require('jsonwebtoken');
const app = require('../src/server.js'); 
const expect = chai.expect;

chai.use(chaiHttp);

describe('OAuth-helper route module', function() {
  describe('GET /auth', function() {
    it('should return status 200 when accessed with a valid JWT', function(done) {
      const token = jwt.sign({ sub: process.env.MONDAY_SIGNING_SECRET }, 'secret', { expiresIn: '1h' });
      chai.request(app)
        .get('/auth')
        .set('Authorization', `Bearer ${token}`)
        .end(function(err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  describe('GET /tokenHandle', function() {
    it('should return status 200 when accessed with a valid JWT', function(done) {
      const token = jwt.sign({ sub: process.env.MONDAY_SIGNING_SECRET}, 'secret', { expiresIn: '1h' });
      chai.request(app)
        .get('/tokenHandle')
        .set('Authorization', `Bearer ${token}`)
        .end(function(err, res) {
          expect(res).to.have.status(200);
          done();
        });
    });
  });

  describe('GET /invalid_route', function() {
    it('should return status 500 when an error occurs', function(done) {
      chai.request(app)
        .get('/invalid_route')
        .end(function(err, res) {
          expect(res).to.have.status(500);
          done();
        });
    });
  });
});
