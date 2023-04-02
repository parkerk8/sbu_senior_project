const assert = require('chai').assert;
const OAuth2Client = require('google-auth-library').OAuth2Client;
const googleAuth = require("../src/OAuth/google-auth.js");

describe('OAuth2Client', function() {
  describe('#generateAuthUrl()', function() {
    it('should redirect to the generated URL with valid parameters', function() {
      const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
	      process.env.GOOGLE_CLIENT_SECRET,
	      process.env.BACK_TO_URL
      );

      const res = {
        redirect: function(url) {
          assert.match(url, /^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth\?access_type=offline&scope=.+$/);
          return this;
        },
        status: function(code) {
          assert.fail(`Response status code ${code} should not have been called`);
          return this;
        },
        send: function() {
          assert.fail('Response send should not have been called');
          return this;
        }
      };

      try {
        const url = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: googleAuth.SCOPES
        });
        res.redirect(url);
      } catch (err) {
        assert.fail(`An error occurred while generating the authentication URL: ${err}`);
      }
    });

    it('should return a 500 error if the URL cannot be generated', function() {
      const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
	      process.env.GOOGLE_CLIENT_SECRET,
	      process.env.BACK_TO_URL
      );
      const res = {
        redirect: function(url) {
          assert.fail(`Response redirect should not have been called with URL ${url}`);
          return this;
        },
        status: function(code) {
          assert.equal(code, 500);
          return this;
        },
        send: function() {
          assert.ok(true);
          return this;
        }
      };

      try {
        oauth2Client.generateAuthUrl();
      } catch (err) {
        assert.equal(err.message, 'Invalid parameters');
        res.status(500).send();
      }
    });
  });
});