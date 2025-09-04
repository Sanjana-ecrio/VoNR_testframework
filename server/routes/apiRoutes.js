const statusController = require("../controllers/status");
const authorizeController = require('../controllers/authorize');
const logger = require('../utils/logger');

const routes = [
  {
    method: 'POST',
    pathRegex: /^\/nhss-ims-uecm\/v1\/impu-[^\/]+\/authorize$/,
    controller: authorizeController.authorizeUE
  },
  // Future routes
];

async function handleRequest(stream, method, path, headers, body) {
  try {
    const route = routes.find(r => r.method === method && r.pathRegex.test(path));

    if (!route) {
      stream.respond({ ':status': 404, 'content-type': 'application/json' });
      stream.end(JSON.stringify({ error: 'Not Found', path }));
      return;
    }

    const impuMatch = path.match(/impu-([^\/]+)/);
    const impu = impuMatch ? decodeURIComponent(impuMatch[1]) : null;

    let parsedBody = null;
    if (body) {
      try { parsedBody = JSON.parse(body); } 
      catch { parsedBody = body; }
    }

    if (impu) parsedBody = { ...parsedBody, impuFromPath: impu };
    await route.controller(stream, headers, parsedBody);
  } catch (err) {
    logger.error({ err }, 'Error in route handling');
    stream.respond({ ':status': 500, 'content-type': 'application/json' });
    stream.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
}



module.exports = { handleRequest };
