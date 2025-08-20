const statusController = require('../controllers/status');
const echoController = require('../controllers/echo');

const routes = {
  'GET /status': statusController.getStatus,
  'POST /echo': echoController.postEcho
};

async function handleRequest(stream, method, path, headers) {
  const key = `${method} ${path}`;
  const controller = routes[key];

  if (controller) {
    await controller(stream, headers);
  } else {
    stream.respond({ ':status': 404, 'content-type': 'application/json' });
    stream.end(JSON.stringify({ error: 'Not Found' }));
  }
}

module.exports = { handleRequest };
