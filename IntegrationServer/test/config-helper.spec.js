const assert = require('chai').assert;
const sinon = require('sinon');
const configHelper = require('../src/config/config-helper.js');

describe('config', function() {
  describe('setConfigVariables', function() {
    it('should throw an error if the config object is invalid', function() {
      assert.throws(function() {
        configHelper.setConfigVariables(null);
      }, Error);
    });

    it('should set the config variables correctly', function() {
      const columnIds = [
        { id: '1', title: process.env.WORK_PHONE_TITLE },
        { id: '2', title: process.env.EMAIL_PRIMARY_TITLE }
      ];
      const settings = {
        createNewDatabase: false
      };
      const config = { columnIds, settings };

      configHelper.setConfigVariables(config);

      const expectedConfigVariables = {
        workPhoneId: '',
        mobilePhoneId: '',
        primaryEmailId: '',
        secondaryEmailId: '',
        notesId: '',
        createNewDatabase: true
      };
      const actualConfigVariables = configHelper.getConfigVariables();

      assert.deepEqual(actualConfigVariables, expectedConfigVariables);
    });
  });
});