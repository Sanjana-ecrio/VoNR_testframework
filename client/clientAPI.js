const http2 = require('http2');
const fs = require('fs');

const client = http2.connect('https://localhost:9000', {
  ca: fs.readFileSync('../server/server.crt')
});

client.on('error', (err) => console.error(err));

function request(method, path, data = null) {
  return new Promise((resolve, reject) => {
    const req = client.request({ ':method': method, ':path': path });

    let chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

module.exports = { request, client };
