/*const chai = require('chai');
const expect = chai.expect;
const fs = require('fs');

const { updateToken } = require('../src/OAuth/token-store-periodic.js');

describe('updateToken', () => {
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