var google_auth = require("../src/OAuth/google-auth.js");
const chai = require('chai');
const chaiHttp = require('chai-http');
const { expect } = chai;
const { describe, it } = require('mocha');

chai.use(chaiHttp);

describe('OAuth2Client generateAuthUrl', () => {
  it('should redirect to the authorization URL with the expected parameters', async () => {
    const expectedUrl = 'https://accounts.google.com/o/oauth2/v2/auth?access_type=offline&scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fdrive';
    const res = {
      redirect: (url) => {
        expect(url).to.equal(expectedUrl);
        done();
      },
      status: () => ({
        send: () => {}
      })
    };
    const OAuth2Client = new GoogleAuth.OAuth2Client({
      clientId: '949681890895-kaoot1p07us43e1pqlrcu7li4t6vhous.apps.googleusercontent.com',
      clientSecret: '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',
      redirectUri: 'https://sbuseniorprojectv2.tumekie1999.repl.co/tokenHandle',
    });
    const generateAuthUrlStub = sinon.stub(OAuth2Client, 'generateAuthUrl').returns(expectedUrl);

    await myController.generateAuthorizationUrl(req, res);

    expect(generateAuthUrlStub).to.have.been.calledWith({ access_type: 'offline', scope: SCOPES });
  });

  it('should handle errors when generating the authorization URL', async () => {
    const errorMessage = 'Some error message';
    const res = {
      status: () => ({
        send: () => {}
      })
    };
    const OAuth2Client = new GoogleAuth.OAuth2Client({
      clientId: '949681890895-kaoot1p07us43e1pqlrcu7li4t6vhous.apps.googleusercontent.com',
      clientSecret: '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',
      redirectUri: 'https://sbuseniorprojectv2.tumekie1999.repl.co/tokenHandle',
    });
    const generateAuthUrlStub = sinon.stub(OAuth2Client, 'generateAuthUrl').throws(new Error(errorMessage));
    const consoleErrorStub = sinon.stub(console, 'error');

    await myController.generateAuthorizationUrl(req, res);

    expect(generateAuthUrlStub).to.have.been.calledWith({ access_type: 'offline', scope: SCOPES });
    expect(consoleErrorStub).to.have.been.calledWith('The URL could not be generated', new Error(errorMessage));
    expect(res.status()).to.have.been.calledWith(500);
  });
});
