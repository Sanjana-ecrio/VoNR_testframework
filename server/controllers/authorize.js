const { handleFileResponse } = require("./fileresponse");

async function authorizeUE(stream, headers, body) {
  if (!body.impi || !body.authorizationType || !body.visitedNetworkIdentifier) {
    stream.respond({ ':status': 400, 'content-type': 'application/json' });
    stream.end(JSON.stringify({ error: 'Missing required fields' }));
    return;
  }

  const isFailure = body.forceFailure === true;

  //  after "@"
  const domain = body.impi.split("@")[1];

  // dynamic org
  const dynamicData = {
    scscfSelectionAssistanceInfo: {
      scscfNames: [`sip:scscf.${domain}:6060`]
    }
  };

  handleFileResponse(stream, headers, body, "authorizeUE", isFailure, 200, dynamicData);
}

module.exports = { authorizeUE };
