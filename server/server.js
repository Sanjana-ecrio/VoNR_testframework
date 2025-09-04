const http2 = require('http2');
const fs = require('fs');
const apiRoutes = require('./routes/apiRoutes');
const logger = require('./utils/logger');


const serverOptions = {
  key: fs.readFileSync('server.key'),
  cert: fs.readFileSync('server.crt')
};

const server = http2.createSecureServer(serverOptions);

server.on('error', (err) => console.error(err));

server.on('stream', async (stream, headers) => {
  const method = headers[':method'];
  const path = headers[':path'];

  logger.info({ method, path }, "Received request");

  let body = '';
  stream.on('data', (chunk) => {
    body += chunk;
  });

  stream.on('end', async () => {
    logger.info({body}, "Full Body Received:");

    try {
         await apiRoutes.handleRequest(stream, method, path, headers, body);
    } catch (err) {
      console.error({err}, 'Error handling request:');
      stream.respond({ ':status': 500, 'content-type': 'application/json' });
      stream.end(JSON.stringify({ error: 'Internal Server Error' }));
    }
  });
});

server.listen(3000, () => {
  logger.info('HTTP2 TLS server running at https://localhost:3000');
});
