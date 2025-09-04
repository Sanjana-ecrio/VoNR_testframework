const http2 = require("http2");
const dotenv = require("dotenv");

dotenv.config();
const logger = require('./logger');

async function sendToHttp2Server(method, url, path, headers = {}, body = "") {
  return new Promise((resolve, reject) => {

    const client = http2.connect(url,  {
      rejectUnauthorized: false, // trust self-signed certificate
    });
    console.log("MAin server", client)
    client.on("error", (err) => {
      logger.error("HTTP/2 connection error:", err);
      reject(err);
    });

    const req = client.request({
      ":method": method,
      ":path": path,
      ...headers,
    });

    let data = [];
    req.on("data", (chunk) => data.push(chunk));
    req.on("end", () => {
      client.close();
      resolve({
        response: Buffer.concat(data).toString(),
        statusCode: req.rstCode || 200,
      });
    });

    if (body && method !== "GET") {
      req.write(body);
    }

    req.end();
  });
}


async function handleAuthorize(payload) {
  const client = http2.connect(process.env.API_BASE_URL, {
    rejectUnauthorized: false, 
  });

  const path = `/nhss-ims-uecm/v1/impu-${encodeURIComponent(payload.ueImpu)}/authorize`;

  const req = client.request({
    ":method": "POST",
    ":path": path,
    "content-type": "application/json",
  });

  const body = JSON.stringify({
    impi: payload.impi,
    authorizationType: payload.authorizationType,
    visitedNetworkIdentifier: payload.visitedNetworkIdentifier,
  });

  req.write(body);
  req.end();

  return new Promise((resolve, reject) => {
    let data = "";
    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      client.close();
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(err);
      }
    });

    req.on("error", reject);
  });
}

module.exports = { handleAuthorize , sendToHttp2Server };
