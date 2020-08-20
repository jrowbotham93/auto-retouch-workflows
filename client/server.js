const express = require('express');
const { join } = require('path');
const authConfig = require('./auth_config.json');
const opn = require('opn');
const got = require('got');
const app = express();

app.use(express.static(join(__dirname, 'public')));

async function handleApiRequests(access_token) {
  try {
    let options = {
      method: 'GET',
      headers: {
        'content-type': 'application/json',
        authorization: `Bearer ${access_token}`
      }
    };

    const url = `https://${authConfig.domain}/workflow`;
    const response = await got(url, options);
    if (options.method === 'HEAD') console.log(response);

    return JSON.parse(response.body);
  } catch (error) {
    return { error };
  }
}

async function handleGetTokens(device_code) {
  try {
    let options = {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      form: {
        grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
        device_code,
        client_id: 'V8EkfbxtBi93cAySTVWAecEum4d6pt4J'
      }
    };
    const url = `https://${authConfig.auth}/oauth/token`;

    const response = await got(url, options);
    if (options.method === 'HEAD') console.log(response);

    return JSON.parse(response.body);
  } catch (error) {
    return { error };
  }
}

async function handleAuthFlow() {
  try {
    const options = {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      form: {
        client_id: authConfig.clientId,
        audience: `https://${authConfig.audience}`
      }
    };
    const url = `https://${authConfig.auth}/oauth/device/code`;

    const response = await got(url, options);
    if (options.method === 'HEAD') console.log(response);

    return JSON.parse(response.body);
  } catch (error) {
    return { error };
  }
}

const handleToken = (device_code, interval) => {
  // here we implement our polling based on the interval received from auth server
  let token = new Promise(function(resolve, reject) {
    setTimeout(function() {
      resolve(handleGetTokens(device_code));
    }, interval * 1000);
  });
  return token;
};

// one endpoint which kicks of auth flow and returns api content to FE
app.get('/workflows', async function(req, res) {
  const {
    verification_uri_complete,
    device_code,
    interval
  } = await handleAuthFlow();

  opn(verification_uri_complete);

  const { access_token } = await handleToken(device_code, interval);
  const response = await handleApiRequests(access_token);

  res.send({ response });
});

app.get('/*', (req, res) => {
  res.sendFile(join(__dirname, 'index.html'));
});

app.listen(3000, () => console.log('Application running on port 3000'));
