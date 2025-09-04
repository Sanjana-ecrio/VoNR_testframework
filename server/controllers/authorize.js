const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');


const responseFile = path.join(__dirname, '..', 'utils','authorizeResp.json');

async function authorizeUE(stream, headers, body) {
  try {
    const impu = body.impi || body.impuFromPath;
    if (!body.impi || !body.authorizationType || !body.visitedNetworkIdentifier) {
      stream.respond({ ':status': 400, 'content-type': 'application/json' });
      stream.end(JSON.stringify({ error: 'Missing required fields' }));
      return;
    }

    let responseData;
    try {
      const fileContent = fs.readFileSync(responseFile, 'utf8');
      responseData = JSON.parse(fileContent);
    } catch (err) {
      logger.error('Error reading response file:', err);
      stream.respond({ ':status': 500, 'content-type': 'application/json' });
      stream.end(JSON.stringify({ error: 'Internal Server Error reading file' }));
      return;
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      requestPath: headers[':path'],
      requestBody: body,
      response: responseData
    };
    fs.appendFileSync(path.join(__dirname, '..', 'responses.log'), JSON.stringify(logEntry) + "\n");

    stream.respond({ ':status': 200, 'content-type': 'application/json' });
    stream.end(JSON.stringify(responseData));

    logger.info({ impu, body, response: responseData }, 'Authoris req handled with file response');
  } catch (err) {
    logger.error({ err }, 'Error in authorizeController');
    stream.respond({ ':status': 500, 'content-type': 'application/json' });
    stream.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
}

module.exports = { authorizeUE };
