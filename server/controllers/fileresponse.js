const fs = require("fs");
const path = require("path");
const logger = require("../utils/logger"); // assuming you already have this

// 
function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (
      source[key] instanceof Object &&
      key in target &&
      target[key] instanceof Object
    ) {
      target[key] = deepMerge(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
  return target;
}

function handleFileResponse(stream, headers, body, routeKey, isFailure = false, statusCode = 200, dynamicData = {}) {
  try {
    const responseFile = path.join(__dirname, "..", "utils", "allresponses.json");
    const fileContent = fs.readFileSync(responseFile, "utf8");
    const allResponses = JSON.parse(fileContent);

    if (!allResponses[routeKey]) {
      throw new Error(`No responses defined for routeKey: ${routeKey}`);
    }

    let responseData = isFailure
      ? allResponses[routeKey].failure
      : allResponses[routeKey].success;

    // dynamicData if provided
    if (dynamicData && Object.keys(dynamicData).length > 0) {
      responseData = deepMerge(responseData, dynamicData);
    }

    const logEntry = {
      timestamp: new Date().toISOString(),
      routeKey,
      requestPath: headers[":path"],
      requestBody: body,
      response: responseData,
    };
    fs.appendFileSync(
      path.join(__dirname, "..", "responses.log"),
      JSON.stringify(logEntry) + "\n"
    );

    stream.respond({ ":status": statusCode, "content-type": "application/json" });
    stream.end(JSON.stringify(responseData));

    logger.info(`File response sent | Status: ${statusCode} | Response: ${JSON.stringify(responseData)}`);
  } catch (err) {
    logger.error({ err }, `Error in handleFileResponse for ${routeKey}`);
    stream.respond({ ":status": 500, "content-type": "application/json" });
    stream.end(JSON.stringify({ error: "Internal Server Error reading file" }));
  }
}

module.exports = { handleFileResponse };
