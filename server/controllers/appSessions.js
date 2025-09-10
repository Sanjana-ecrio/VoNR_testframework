const { handleFileResponse } = require("./fileresponse");

async function createAppSession(stream, headers, body) {
  if (!body.ascReqData || !body.ascReqData.supi || !body.ascReqData.ueIpv4) {
    stream.respond({ ":status": 400, "content-type": "application/json" });
    stream.end(JSON.stringify({ error: "Missing required fields" }));
    return;
  }

  const isFailure = body.forceFailure === true;

  handleFileResponse(stream, headers, body, "appSessions", isFailure, 201);
}

module.exports = { createAppSession };
