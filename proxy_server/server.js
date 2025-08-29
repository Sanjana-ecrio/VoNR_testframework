const http = require('http');
const { handleProxy } = require('./proxyHandler');
const { PORT } = require('./config');

const server = http.createServer(handleProxy);

server.listen(PORT, () => {
  console.log(`Proxy server running at http://localhost:${PORT}`);
});
    