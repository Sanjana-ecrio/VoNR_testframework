// proxy.js
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { sendToHttp2Server } = require("./http2Client");

const app = express();

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post("/", async (req, res) => {
  try {
    console.log("Received Req", req.body);
    const { method, url, body } = req.body;

    if (!method || !url) {
      return res.status(400).send("Invalid request format (use: { method, path, body })");
    }

    const urlObj = new URL(url);

// Extract server URL (protocol + host:port)
const serverUrl = `${urlObj.protocol}//${urlObj.host}`;

// Extract path only
const path = urlObj.pathname;

console.log("Server URL:", serverUrl); 
// 👉 http://3.90.179.39:8080

console.log("Path:", path);   
    console.log("Proxying:", method, url, body);

    const headers = { "content-type": "application/json" };

    const { response, statusCode } = await sendToHttp2Server(
      method,
      serverUrl.toString(),
      path,
      headers,
      body ? JSON.stringify(body) : ""
    );

    const responseStr = typeof response === "string" ? response : JSON.stringify(response);

    res.status(statusCode).send(responseStr);

  } catch (err) {
    console.error("Proxy error:", err);
    res.status(500).send("Proxy failed: " + err.message);
  }
});

app.listen(4000, () => {
  console.log("Proxy server listening at http://localhost:4000");
});
