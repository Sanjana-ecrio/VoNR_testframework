// http2Client.js
const http2 = require("http2");
const { MAIN_SERVER } = require('./config');

async function sendToHttp2Server(method, url, path, headers = {}, body = "") {
  return new Promise((resolve, reject) => {

    const client = http2.connect(url,  {
      rejectUnauthorized: false, // trust self-signed certificate
    });
    console.log("MAin server", client)
    client.on("error", (err) => {
      console.error("HTTP/2 connection error:", err);
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

module.exports = { sendToHttp2Server };
