const request = require('supertest');
const app = require('../src/server.js'); 
const { expect } = require('chai');
const { authRequestMiddleware } = require('../src/middleware/auth-request');

describe('Contact API', () => {
  describe('POST /create', () => {
    it('should create a new contact', async () => {
      const res = await request(app)
        .post('/create', authRequestMiddleware)
        .set('Authorization', 'Bearer ' + '2eafc3071d6063e3daae0f8622e87ecf')
        .send({
          name: 'John Doe',
          email: 'johndoe@example.com',
          phone: '555-555-5555'
        })
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('id');
    });
  });

  describe('POST /update', () => {
    it('should update an existing contact', async () => {
      const res = await request(app)
        .post('/update')
        .set('Authorization', 'Bearer ' + '2eafc3071d6063e3daae0f8622e87ecf')
        .send({
          id: 1,
          name: 'Jane Doe',
          email: 'janedoe@example.com',
          phone: '555-555-5555'
        });
      expect(res.status).to.equal(200);
      expect(res.body).to.have.property('id');
    });
  });

  describe('POST /sync', () => {
    it('should fetch and synchronize contacts', async () => {
      const res = await request(app)
        .post('/sync')
        .set('Authorization', 'Bearer ' + '2eafc3071d6063e3daae0f8622e87ecf')
        .send({});
      expect(res.status).to.equal(200);
      expect(res.body).to.be.an('array');
    });
  });
});