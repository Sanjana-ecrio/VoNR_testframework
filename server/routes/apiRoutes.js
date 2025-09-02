const statusController = require("../controllers/status");
const logger = require('../utils/logger');

const controllers = {
  'GET /': statusController.getStatus,
  'POST /': statusController.postStatus,
  // Example for POST route:
  // 'POST /myroute': myController.handleMyPost
};

async function handleRequest(stream, method, path, headers, body) {
  const key = `${method} ${path}`;
  const controller = controllers[key];

  if (controller) {
    try {
      // Parse body if JSON
      let parsedBody = null;
      if (body) {
        try {
          parsedBody = JSON.parse(body);
        } catch (err) {
          parsedBody = body; // fallback to raw text
        }
      }

      await controller(stream, headers, parsedBody);
    } catch (err) {
      console.error({err}, "Error in controller:");
      stream.respond({ ':status': 500, 'content-type': 'application/json' });
      stream.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  } else {
    stream.respond({ ':status': 404, 'content-type': 'application/json' });
    stream.end(JSON.stringify({ error: 'Not Found', path }));
  }
}

module.exports = { handleRequest };
