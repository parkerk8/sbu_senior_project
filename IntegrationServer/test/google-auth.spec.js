const assert = require('chai').assert
const fs = require('fs')
const chai = require('chai')
const expect = chai.expect
const sinon = require('sinon')
const google = require('googleapis');
const OAuth2Client = require('google-auth-library').OAuth2Client
const googleAuth = require('../src/OAuth/google-auth.js')
const chaiSinon = require('sinon-chai')
const myCache = googleAuth.myCache;
const proxyquire = require('proxyquire');
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
describe('codeHandle function', () => {
  let req, res, myCache, fs, OAuth2Client;

  beforeEach(() => {
    req = {
      query: {
        code: 'test_code'
      }
    };
    res = {
      status: sinon.stub().returnsThis(),
      send: sinon.stub(),
      redirect: sinon.stub()
    };
    myCache = {
      get: sinon.stub(),
      del: sinon.stub()
    };
    fs = {
      existsSync: sinon.stub(),
      readFile: sinon.stub(),
      writeFile: sinon.stub()
    };
    OAuth2Client = {
      getToken: sinon.stub(),
      credentials: {}
    };
  });

  it('should return an empty object if backToUrl is undefined', async () => {
    myCache.get.returns(undefined);

    const { codeHandle } = proxyquire('../src/OAuth/google-auth', {
      'fs': fs,
      'myCache': myCache,
      'google-auth-library': {
        OAuth2Client: sinon.stub().returns(OAuth2Client)
      }
    });

    await codeHandle(req, res);

    expect(myCache.del.called).to.be.false;
    expect(fs.existsSync.called).to.be.false;
    expect(OAuth2Client.getToken.called).to.be.false;
    expect(res.status.calledWith(200)).to.be.true;
    expect(res.send.calledWith({})).to.be.true;
  });

  it('should redirect to backToUrl if token.json file exists', async () => {
    myCache.get.returns('https://example.com/');
   
    const { codeHandle } = proxyquire('../src/OAuth/google-auth', {
      'fs': fs,
      'myCache': myCache,
      'google-auth-library': {
        OAuth2Client: sinon.stub().returns(OAuth2Client)
      }
    });
  
    console.log(myCache.del.calledOnce); // Add this line
    await codeHandle(req, res);
  
    expect(myCache.del.calledOnce).to.be.true;
    expect(fs.existsSync.calledOnce).to.be.true;
    expect(fs.readFileSync.calledOnce).to.be.true;
    expect(OAuth2Client.credentials.access_token).to.equal('test_token');
    expect(res.redirect.calledWith('https://example.com/')).to.be.true;
  
    // Clean up the stub functions
    fs.existsSync.restore();
    fs.readFileSync.restore();
  });

  it('should store token to file and redirect to backToUrl if token.json file does not exist', async () => {
    myCache.get.returns('https://example.com/');
    OAuth2Client.getToken.yields(null, { access_token: 'test_token' });
  
    const { codeHandle } = proxyquire('../src/OAuth/google-auth', {
      'fs': fs,
      'myCache': myCache,
      'google-auth-library': {
        OAuth2Client: sinon.stub().returns(OAuth2Client)
      }
    });
  
    await codeHandle(req, res);
  
    expect(myCache.del.calledOnce).to.be.true;
    expect(fs.existsSync.calledOnce).to.be.true;
    expect(OAuth2Client.getToken.calledOnce).to.be.true;
    expect(fs.writeFileSync.calledOnce).to.be.true;
    expect(OAuth2Client.credentials.access_token).to.equal('test_token');
    expect(res.redirect.calledWith('https://example.com/')).to.be.true;
  
    // Clean up the stub functions
    fs.existsSync.restore();
    fs.writeFileSync.restore();
  });
});