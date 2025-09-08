const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const responseFile = path.join(__dirname, '..', 'utils', 'authorizeResp.json');

/**
 * Generic file-based response handler
 * @param {Object} stream - HTTP/2 stream
 * @param {Object} headers - request headers
 * @param {Object} body - request body
 * @param {String} routeKey - which route to pick from JSON (e.g. "authorizeUE" or "generateSipAuth")
 * @param {Boolean} isFailure - whether to send failure response
 */
// function handleFileResponse(stream, headers, body, routeKey, isFailure = false) {
//   try {
//     const fileContent = fs.readFileSync(responseFile, 'utf8');
//     const allResponses = JSON.parse(fileContent);

//     if (!allResponses[routeKey]) {
//       throw new Error(`No responses defined for routeKey: ${routeKey}`);
//     }

//     const responseData = isFailure
//       ? allResponses[routeKey].failure
//       : allResponses[routeKey].success;

//     // Log request/response
//     const logEntry = {
//       timestamp: new Date().toISOString(),
//       routeKey,
//       requestPath: headers[':path'],
//       requestBody: body,
//       response: responseData
//     };
//     fs.appendFileSync(
//       path.join(__dirname, '..', 'responses.log'),
//       JSON.stringify(logEntry) + "\n"
//     );

//     stream.respond({ ':status': 200, 'content-type': 'application/json' });
//     stream.end(JSON.stringify(responseData));

//     logger.info({ routeKey, body, response: responseData }, 'File response sent');
//   } catch (err) {
//     logger.error({ err }, `Error in handleFileResponse for ${routeKey}`);
//     stream.respond({ ':status': 500, 'content-type': 'application/json' });
//     stream.end(JSON.stringify({ error: 'Internal Server Error reading file' }));
//   }
// }
// function handleFileResponse(stream, headers, body, routeKey, isFailure = false, successStatus = 200) {
//   try {
//     const fileContent = fs.readFileSync(responseFile, 'utf8');
//     const allResponses = JSON.parse(fileContent);

//     if (!allResponses[routeKey]) {
//       throw new Error(`No responses defined for routeKey: ${routeKey}`);
//     }

//     const responseData = isFailure
//       ? allResponses[routeKey].failure
//       : allResponses[routeKey].success;

//     // Log request/response
//     const logEntry = {
//       timestamp: new Date().toISOString(),
//       routeKey,
//       requestPath: headers[':path'],
//       requestBody: body,
//       response: responseData
//     };
//     fs.appendFileSync(
//       path.join(__dirname, '..', 'responses.log'),
//       JSON.stringify(logEntry) + "\n"
//     );

//     const statusCode = isFailure ? 400 : successStatus;

//     stream.respond({ ':status': statusCode, 'content-type': 'application/json' });
//     stream.end(JSON.stringify(responseData));

//     logger.info(
//       { routeKey, statusCode, body, response: responseData },
//       'File response sent'
//     );
//   } catch (err) {
//     logger.error({ err }, `Error in handleFileResponse for ${routeKey}`);
//     stream.respond({ ':status': 500, 'content-type': 'application/json' });
//     stream.end(JSON.stringify({ error: 'Internal Server Error reading file' }));
//   }
// }
function handleFileResponse(stream, headers, body, routeKey, isFailure = false, statusCode = 200) {
  try {
    const fileContent = fs.readFileSync(responseFile, "utf8");
    const allResponses = JSON.parse(fileContent);

    if (!allResponses[routeKey]) {
      throw new Error(`No responses defined for routeKey: ${routeKey}`);
    }

    const responseData = isFailure
      ? allResponses[routeKey].failure
      : allResponses[routeKey].success;

    // Log request/response
    const logEntry = {
      timestamp: new Date().toISOString(),
      routeKey,
      requestPath: headers[":path"],
      requestBody: body,
      response: responseData,
    };
    fs.appendFileSync(path.join(__dirname, "..", "responses.log"), JSON.stringify(logEntry) + "\n");

    stream.respond({ ":status": statusCode, "content-type": "application/json" });
    stream.end(JSON.stringify(responseData));

    logger.info({ routeKey, body, response: responseData }, "File response sent");
  } catch (err) {
    logger.error({ err }, `Error in handleFileResponse for ${routeKey}`);
    stream.respond({ ":status": 500, "content-type": "application/json" });
    stream.end(JSON.stringify({ error: "Internal Server Error reading file" }));
  }
}



module.exports = { handleFileResponse };
