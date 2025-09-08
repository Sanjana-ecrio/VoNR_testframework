const fs = require("fs");
const path = require("path");

const responseFile = path.join(__dirname, "..", "utils", "responses.json");

async function modAppSession(payload) {
  if (!payload.sbiEndpoint || !payload.ascReqData) {
    throw new Error("Missing required fields for modAppSession");
  }

  const fileContent = fs.readFileSync(responseFile, "utf8");
  const allResponses = JSON.parse(fileContent);

  if (!allResponses.modAppSession || !allResponses.modAppSession.success) {
    throw new Error("No response defined for modAppSession in file");
  }

  return allResponses.modAppSession.success;
}

module.exports = { handleModAppSession };
