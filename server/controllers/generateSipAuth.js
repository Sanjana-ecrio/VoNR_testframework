const { handleFileResponse } = require("./fileresponse");

async function generateSipAuth(stream, headers, body) {
  if (!body.cscfServerName || !body.sipAuthenticationScheme || !body.sipNumberAuthItems) {
    stream.respond({ ':status': 400, 'content-type': 'application/json' });
    stream.end(JSON.stringify({ error: 'Missing required fields' }));
    return;
  }

  const isFailure = body.forceFailure === true;

  handleFileResponse(stream, headers, body, "generateSipAuth", isFailure, 200);
}

module.exports = { generateSipAuth };
