const statusAPI = require('./apiendpoints/status');
const echoAPI = require('./apiendpoints/echo');
const { client } = require('./clientAPI');

async function runTests() {
  await statusAPI.getStatus();
  await echoAPI.echo({ message: 'Hello VoNR' });

  client.close();
}

runTests();

