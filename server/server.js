const http2 = require('http2');
const fs = require('fs');
const apiRoutes = require('./routes/apiRoutes');

const serverOptions = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};

const server = http2.createSecureServer(serverOptions);

server.on('error', (err) => console.error(err));

server.on('stream', async (stream, headers) => {
  const method = headers[':method'];
  const path = headers[':path'];

  console.log(`Received ${method} request for ${path}`);

  await apiRoutes.handleRequest(stream, method, path, headers);
});

server.listen(9000, () => {
  console.log('HTTP2 TLS server running at https://localhost:8443');
});
 
