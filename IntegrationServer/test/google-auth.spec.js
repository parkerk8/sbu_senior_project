const assert = require('chai').assert
const fs = require('fs')
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const google = require('googleapis');
const OAuth2Client = require('google-auth-library').OAuth2Client
const googleAuth = require('../src/OAuth/google-auth.js')
const chaiSinon = require('sinon-chai')
const myCache = require('memory-cache')
chai.use(chaiSinon)

const { setUpOAuth } = require('../src/OAuth/google-auth.js')
const { codeHandle } = require('../src/OAuth/google-auth.js')

// Integration Tests?
describe('OAuth2Client', function () {
  describe('#generateAuthUrl()', function () {
    it('should redirect to the generated URL with valid parameters', function () {
      const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
	      process.env.GOOGLE_CLIENT_SECRET,
	      process.env.BACK_TO_URL
      )

      const res = {
        redirect: function (url) {
          assert.match(url, /^https:\/\/accounts\.google\.com\/o\/oauth2\/v2\/auth\?access_type=offline&scope=.+$/)
          return this
        },
        status: function (code) {
          assert.fail(`Response status code ${code} should not have been called`)
          return this
        },
        send: function () {
          assert.fail('Response send should not have been called')
          return this
        }
      }

      try {
        const url = oauth2Client.generateAuthUrl({
          access_type: 'offline',
          scope: googleAuth.SCOPES
        })
        res.redirect(url)
      } catch (err) {
        assert.fail(`An error occurred while generating the authentication URL: ${err}`)
      }
    })

    it('should return a 500 error if the URL cannot be generated', function () {
      const oauth2Client = new OAuth2Client(
        process.env.GOOGLE_CLIENT_ID,
	      process.env.GOOGLE_CLIENT_SECRET,
	      process.env.BACK_TO_URL
      )
      const res = {
        redirect: function (url) {
          assert.fail(`Response redirect should not have been called with URL ${url}`)
          return this
        },
        status: function (code) {
          assert.equal(code, 500)
          return this
        },
        send: function () {
          assert.ok(true)
          return this
        }
      }

      try {
        oauth2Client.generateAuthUrl()
      } catch (err) {
        assert.equal(err.message, 'Invalid parameters')
        res.status(500).send()
      }
    })
  })
})

// UNIT TESTS
describe('setUpOAuth', () => {
  const req = { session: { backToUrl: 'http://example.com' } }
  const res = { redirect: sinon.stub() }
  const SCOPES = ['https://www.googleapis.com/auth/contacts']
  const TOKEN_PATH = './token.json'

  beforeEach(() => {
    sinon.restore()
    sinon.stub(OAuth2Client.prototype, 'generateAuthUrl').returns('http://example.com/auth')
    sinon.stub(fs, 'existsSync').returns(false)
    sinon.stub(fs, 'readFile')
    sinon.stub().returnsThis()
  })

  afterEach(() => {
    sinon.restore()
  })

  it('should redirect to authorization URL if token does not exist', async () => {
    await setUpOAuth(req, res)
    assert.ok(res.redirect.calledOnceWith('http://example.com/auth'))
    assert.ok(fs.existsSync.calledOnceWith(TOKEN_PATH))
    assert.ok(OAuth2Client.prototype.generateAuthUrl.calledOnceWith({
      access_type: 'offline',
      scope: SCOPES
    }))
  })

  it('should redirect to backToUrl if token exists', async () => {
    const req = { session: { backToUrl: 'http://example.com' } }
    const res = { redirect: sinon.spy() }
    fs.existsSync = sinon.stub().returns(true)
    fs.readFile = sinon.stub().callsArgWith(1, null, JSON.stringify({}))

    await new Promise(resolve => {
      setUpOAuth(req, res)
      resolve()
    })

    expect(res.redirect).to.have.been.calledOnceWith('http://example.com')
  })
})

// CODEHANDLE UNIT TESTS
describe('codeHandle', function() {
  let req, res, sandbox;

  beforeEach(function() {
    sandbox = sinon.createSandbox();
    req = {
      query: { code: 'some-code' },
      session: { backToUrl: 'http://localhost:3000/callback' }
    };
    res = { 
      status: sinon.spy(),
      send: sinon.spy(),
      redirect: sinon.spy() 
    };
  });

  afterEach(function() {
    sandbox.restore();
  });

  it('should store the token to disk and redirect to backToUrl', async function() {
    const fsWriteFileStub = sandbox.stub(fs, 'writeFile').callsArgAsync(2);
    const getTokenStub = sandbox.stub(google.auth.OAuth2.prototype, 'getToken').callsArgWithAsync(1, null, { access_token: 'some-access-token', refresh_token: 'some-refresh-token' });

    await codeHandle(req, res);

    sinon.assert.calledOnce(fsWriteFileStub);
    sinon.assert.calledWith(fsWriteFileStub, './token.json', '{"access_token":"some-access-token","refresh_token":"some-refresh-token"}', sinon.match.func);
    sinon.assert.calledOnce(getTokenStub);
    sinon.assert.calledWith(getTokenStub, 'some-code', sinon.match.func);
    sinon.assert.calledOnce(res.redirect);
    sinon.assert.calledWith(res.redirect, 'http://localhost:3000/callback');
  });

  it('should read the token from disk and redirect to backToUrl', async function() {
    const readFileStub = sandbox.stub(fs, 'readFile').callsArgWithAsync(1, null, '{"access_token":"some-access-token","refresh_token":"some-refresh-token"}');
    const setCredentialsStub = sandbox.stub(google.auth.OAuth2.prototype, 'setCredentials');
    
    await codeHandle(req, res);

    sinon.assert.calledOnce(readFileStub);
    sinon.assert.calledWith(readFileStub, './token.json', sinon.match.func);
    sinon.assert.calledOnce(setCredentialsStub);
    sinon.assert.calledWith(setCredentialsStub, { access_token: 'some-access-token', refresh_token: 'some-refresh-token' });
    sinon.assert.calledOnce(res.redirect);
    sinon.assert.calledWith(res.redirect, 'http://localhost:3000/callback');
  });
});