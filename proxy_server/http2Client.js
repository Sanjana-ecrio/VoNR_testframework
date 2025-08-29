const http2 = require('http2');
const fs = require('fs');
const { MAIN_SERVER, MAIN_SERVER_CERT } = require('./config');

async function sendToHttp2Server(method, path, headers = {}, body = null) {
  return new Promise((resolve, reject) => {
    const clientOptions = {};
    if (MAIN_SERVER_CERT) {
      clientOptions.ca = fs.readFileSync(MAIN_SERVER_CERT);
    }

    const client = http2.connect(MAIN_SERVER, clientOptions);

    client.on('error', (err) => reject(err));

    const req = client.request({
      ':method': method,
      ':path': path,
      ...headers
    });

    let chunks = [];
    let statusCode = 200;

    req.on('response', (h) => {
      statusCode = h[':status'] || 200;
    });

    req.on('data', (chunk) => chunks.push(chunk));

    req.on('end', () => {
      client.close(); 
      resolve({ response: Buffer.concat(chunks).toString(), statusCode });
    });

    req.on('error', (err) => {
      client.close();
      reject(err);
    });
  });
}

module.exports = { sendToHttp2Server };
