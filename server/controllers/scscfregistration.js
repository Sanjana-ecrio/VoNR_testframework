const { handleFileResponse } = require("./fileresponse");

async function scscfRegistration(stream, headers, body) {
  if (!body.imsRegistrationType || !body.cscfServerName || !body.scscfInstanceId) {
    stream.respond({ ':status': 400, 'content-type': 'application/json' });
    stream.end(JSON.stringify({ error: 'Missing required fields' }));
    return;
  }

  const isFailure = body.forceFailure === true;
  handleFileResponse(stream, headers, body, "scscfRegistration", isFailure, 201);
}

module.exports = { scscfRegistration };
