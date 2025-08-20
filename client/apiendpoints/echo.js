const apiClient = require('../clientAPI');

async function echo(data) {
  const response = await apiClient.request('POST', '/echo', data);
  console.log('Echo Response:', response);
}

module.exports = { echo };
