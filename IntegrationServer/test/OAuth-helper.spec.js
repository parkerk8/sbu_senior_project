const chai = require('chai');
const expect = chai.expect;
const chaiHttp = require('chai-http');

const app = require('../src/server');
const { authRequestMiddleware } = require('../src/middleware/auth-request.js');

chai.use(chaiHttp);

const BASE_URL = '/auth';
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REDIRECT_URI = process.env.BACK_TO_URL;
const STATE = process.env.RUN;

const validToken = authRequestMiddleware({ sub: 'test_user_id' }, process.env.MONDAY_SIGNING_SECRET, '1h');
const invalidToken = 'invalid_token';
const validCode = 'valid_code';
const invalidCode = 'invalid_code';

describe('Google Auth Router', () => {
  describe(`GET ${BASE_URL}/tokenHandle`, () => {
    it('should return a 401 error when not given a valid token', (done) => {
      chai
        .request(app)
        .get(`${BASE_URL}/tokenHandle`)
        .set('Authorization', `Bearer ${invalidToken}`)
        .end((err, res) => {
          expect(res).to.have.status(401);
          done();
        });
    });

    it('should return a 400 error when not given a valid code', (done) => {
      chai
        .request(app)
        .get(`${BASE_URL}/tokenHandle`)
        .query({ code: invalidCode })
        .end((err, res) => {
          expect(res).to.have.status(400);
          done();
        });
    });

    it('should return a 200 success response with valid parameters', (done) => {
      // TODO: implement test
    });
  });
});