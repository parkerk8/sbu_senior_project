const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');
const sinon = require('sinon');

const { updateToken } = require('../src/OAuth/token-store-periodic.js');

/* describe('updateToken', () => {
  it('should update token in token.json if credentials have changed', (done) => {
    // Mock OAuth2Client.credentials to return some values
    const mockCredentials = {
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token',
      expiry_date: Date.now() + 10, // 1 hour from now
    };
    const originalCredentials = Object.assign({}, mockCredentials);
    require('../src/OAuth/google-auth.js').OAuthClient.credentials = mockCredentials;

    // Make sure token.json file does not exist before running the test
    if (fs.existsSync('./token.json')) {
       fs.writeFileSync('./token.json', '{}', 'utf8');
    }

    // Call updateToken and check if it updates token.json with new credentials
    updateToken();
    setTimeout(() => {
      const updatedCredentials = JSON.parse(fs.readFileSync('./token.json', 'utf8'));
      expect(updatedCredentials).to.be.closeTo(mockCredentials);
      expect(updatedCredentials).to.be.closeTo(originalCredentials);
      done();
    }, 1000); // wait for 1 second for updateToken to finish
  });

  it('should not update token in token.json if credentials have not changed', (done) => {
    // Mock OAuth2Client.credentials to return some values
    const mockCredentials = {
      access_token: 'fake-access-token',
      refresh_token: 'fake-refresh-token',
      expiry_date: Date.now() + 3600 * 1000, // 1 hour from now
    };
    const originalCredentials = Object.assign({}, mockCredentials);
    require('../src/OAuth/google-auth.js').OAuthClient.credentials = mockCredentials;

    // Create a token.json file with original credentials
    fs.writeFileSync('./token.json', JSON.stringify(originalCredentials), 'utf8');

    // Call updateToken and check if it updates token.json with new credentials
    updateToken();
    setTimeout(() => {
      const updatedCredentials = JSON.parse(fs.readFileSync('./token.json', 'utf8'));
      expect(updatedCredentials).to.be.closeTo(originalCredentials);
      expect(updatedCredentials).to.be.closeTo(mockCredentials);
      done();
    }, 1000); // wait for 1 second for updateToken to finish
  });
}); */

describe('updateToken', () => {
  let credentials;
  let readFileStub;
  let writeFileStub;

  beforeEach(() => {
    // Create a dummy credentials object
    credentials = { access_token: 'dummy_token' };
    
    // Stub the `readFile` function so that it returns a buffer containing a JSON-encoded version of the dummy credentials
    readFileStub = sinon.stub(fs, 'readFile').callsFake((path, options, callback) => {
      const buffer = Buffer.from(JSON.stringify(credentials));
      callback(null, buffer);
    });

    // Stub the `writeFile` function so that it calls the callback without an error
    writeFileStub = sinon.stub(fs, 'writeFile').callsFake((path, data, callback) => {
      callback(null);
    });
  });

  afterEach(() => {
    // Restore the original implementations of `readFile` and `writeFile`
    readFileStub.restore();
    writeFileStub.restore();
  });

  it('should update token.json if credentials have changed', (done) => {
    updateToken();

    // Make sure that the `readFile` function was called exactly once with the expected arguments
    expect(readFileStub.calledOnceWith('./token.json', 'utf8')).to.be.true;

    // Make sure that the `writeFile` function was called exactly once with the expected arguments
    expect(writeFileStub.calledOnceWith('./token.json', JSON.stringify(credentials))).to.be.true;

    // Wait for the next tick of the event loop to allow the callback of `fs.writeFile` to execute
    setTimeout(() => {
      // Make sure that the 'Cached token updated' message was printed to the console
      expect(console.log.calledWith('Cached token updated')).to.be.true;

      // Call `done` to signal that the test has completed
      done();
    }, 0);
  });
});