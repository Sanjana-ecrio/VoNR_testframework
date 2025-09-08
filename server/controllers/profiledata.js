const { handleFileResponse } = require("./fileresponse");

async function getProfileData(stream, headers, body) {
  if (!body?.impuFromPath) {
    stream.respond({ ":status": 400, "content-type": "application/json" });
    stream.end(JSON.stringify({ error: "Missing required impu" }));
    return;
  }

  const isFailure = body.forceFailure === true;

  handleFileResponse(stream, headers, body, "getProfileData", isFailure,  200);
}

module.exports = { getProfileData };
