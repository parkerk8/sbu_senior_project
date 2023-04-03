const fs = require('fs');

const configVariables = Object.freeze({
  workPhoneId: '',
  mobilePhoneId: '',
  primaryEmailId: '',
  secondaryEmailId: '',
  notesId: '',
  createNewDatabase: true,
});

const sectionTitlesToVariables = {
  [process.env.WORK_PHONE_TITLE]: 'workPhoneId',
  [process.env.MOBILE_PHONE_TITLE]: 'mobilePhoneId',
  [process.env.EMAIL_PRIMARY_TITLE]: 'primaryEmailId',
  [process.env.EMAIL_SECONDARY_TITLE]: 'secondaryEmailId',
  [process.env.NOTES_TITLE]: 'notesId',
};

/**
 * Sets the config variables based on the provided config object.
 * @param {object} config - The config object.
 * @throws {Error} If the config object is invalid.
 */
function setConfigVariables(config) {
  if (!config || !config.columnIds || !config.settings) {
    throw new Error('Invalid config object');
  }

  const { columnIds, settings } = config;

  for (const section of columnIds) {
    const variableName = sectionTitlesToVariables[section.title];
    if (variableName) {
      configVariables[variableName] = section.id;
    }
  }

  if (settings.hasOwnProperty('createNewDatabase')) {
    configVariables.createNewDatabase = settings.createNewDatabase;
  }
}

/**
 * Returns a copy of the config variables object.
 * @returns {object} A copy of the config variables object.
 */
function getConfigVariables() {
  return { ...configVariables };
}

module.exports = {
  setConfigVariables,
  getConfigVariables,
};