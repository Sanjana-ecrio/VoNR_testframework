const { handleFileResponse } = require("./fileresponse");

async function modAppSession(stream, headers, body) {
  console.log("Body Received: ", body)
  if (!body.ascReqData) {
    stream.respond({ ":status": 400, "content-type": "application/json" });
    stream.end(JSON.stringify({ error: "Missing required fields for modAppSession" }));
    return;
  }

  const isFailure = body.forceFailure === true;


  handleFileResponse(stream, headers, body, "modAppSession", isFailure, 200);
}

module.exports = { modAppSession };
