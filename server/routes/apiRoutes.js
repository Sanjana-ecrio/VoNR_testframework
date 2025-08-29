const statusController = require("../controllers/status")

const controllers = {
  'GET /': statusController.getStatus,
}; 
  /*
  const myController = require('../controllers/myController');
const controllers = {
  'POST /myroute': myController.handleMyPost
}; */
async function handleRequest(stream, method, path, headers) {
  const key = `${method} ${path}`;
  const controller = controllers[key];

  if (controller) {
    await controller(stream, headers);
  } else {
    stream.respond({ ':status': 404, 'content-type': 'application/json' });
    stream.end(JSON.stringify({ error: 'Not Found', path }));
  }
}

module.exports = { handleRequest, controllers };
