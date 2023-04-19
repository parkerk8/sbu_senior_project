const { expect } = require('chai');
const sinon = require('sinon');
const { ContactMapping } = require('../src/db/models');
const {
  getContactMapping,
  createContactMapping,
  updateContactMapping,
  deleteDatabse,
} = require('../src/services/database-services/contact-mapping-service');
console.log(ContactMapping);
describe('Contact Mapping Service', () => {
  afterEach(() => {
    sinon.restore();
  });

  describe('getContactMapping', () => {
    it('should retrieve a contact mapping from the database by itemID', async () => {
      const mockContactMapping = { id: 1, resourceName: 'Primary Email', etag: 'jane@example.com' };
      sinon.stub(ContactMapping, 'findByPk').returns(mockContactMapping);

      const result = await getContactMapping(1);

      expect(result).to.deep.equal(mockContactMapping);
      expect(ContactMapping.findByPk.calledOnceWith(1)).to.be.true;
    });

    it('should log an error if the database query fails', async () => {
      sinon.stub(ContactMapping, 'findByPk').throws(new Error('Database query failed'));

      const consoleSpy = sinon.stub(console, 'error');
      await getContactMapping(0);
      expect(consoleSpy.calledOnceWith(sinon.match('Error: Database query failed'))).to.be.true;
    });
  });

  describe('createContactMapping', () => {
    it('should create a new contact mapping in the database with the provided attributes', async () => {
      const mockAttributes = { itemID: 1, resourceName: 'Primary Email', etag: 'jane@example.com' };
      sinon.stub(ContactMapping, 'create').returns({});

      await createContactMapping(mockAttributes);

      expect(ContactMapping.create.calledOnceWith(mockAttributes)).to.be.true;
    });

    it('should log an error if the database create operation fails', async () => {
      const mockAttributes = { itemID: 1, resourceName: 'Primary Email', etag: 'jane@example.com' };
      sinon.stub(ContactMapping, 'create').throws(new Error('Database create operation failed'));

      const consoleSpy = sinon.stub(console, 'error');
      await createContactMapping(mockAttributes);

      expect(consoleSpy.calledOnceWith(sinon.match('Database create operation failed'))).to.be.true;
    });
  });

  describe('updateContactMapping', () => {
    it('should update an existing contact mapping in the database with the provided attributes', async () => {
      const mockUpdates = { resourceName: 'Secondary Email', etag: 'jane.doe@example.com' };
      sinon.stub(ContactMapping, 'update').returns(1);

      const result = await updateContactMapping(1, mockUpdates);

      expect(result).to.equal(1);
      expect(ContactMapping.update.calledOnceWith(mockUpdates, { where: { id: 1 } })).to.be.true;
    });

    it('should log an error if the database update operation fails', async () => {
      const mockUpdates = { resourceName: 'Secondary Email', etag: 'jane.doe@example.com' };
      sinon.stub(ContactMapping, 'update').throws(new Error('Database update operation failed'));

      const consoleSpy = sinon.stub(console, 'error');
      await updateContactMapping(1, mockUpdates);

      expect(consoleSpy.calledOnceWith(sinon.match('Database update operation failed'))).to.be.true;
    });
  });

    describe('deleteDatabase', () => {
      it('should delete all data from the ContactMapping table', async () => {
      // Insert some test data
      await ContactMapping.bulkCreate([
        { name: 'John', email: 'john@example.com' },
        { name: 'Jane', email: 'jane@example.com' },
      ]);
  
      // Call the deleteDatabase function
      await deleteDatabse();
  
      // Check that ContactMapping.destroy is called with an empty where object
      expect(ContactMapping.destroy.calledOnce).to.be.true;
      expect(ContactMapping.destroy.calledWith({ where: {} })).to.be.true;
  
      // Check that the data is actually deleted from the table
      const contactMappings = await ContactMapping.findAll();
      expect(contactMappings.length).to.equal(0);
    });
  });
});


