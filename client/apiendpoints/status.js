const apiClient = require('../clientAPI');

async function getStatus() {
  const response = await apiClient.request('GET', '/status');
  console.log('Status Response:', response);
}

module.exports = { getStatus };
