import fs from 'fs/promises';
import { setConfigVariables } from './config/config-helper.js';
import { OAuthClient } from './OAuth/google-auth.js';

console.debug('I made it to startup-helper.js');

async function setOAuthCredentials() {
  console.debug('I made it to setUpOAuthCreds in startup-helper.js');
  try {
    const token = await fs.readFile('./token.json');
    OAuthClient.credentials = JSON.parse(token);
    console.debug('OAuth Credentials Set');
  } catch (err) {
    console.error(`Error reading token file: ${err}`);
  }
}

async function loadConfigVariables() {
  console.debug('I made it to loadConfigVariables in startup-helper.js');
  try {
    const config = await fs.readFile('./config.json');
    console.debug('loading config');
    const { parsedConfig } = JSON.parse(config);
    await setConfigVariables(parsedConfig);
    console.debug('configs loaded');
  } catch (err) {
    console.error(`Error reading config file: ${err}`);
  }
}

export { loadConfigVariables, setOAuthCredentials };
