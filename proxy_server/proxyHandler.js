const { sendToHttp2Server } = require('./http2Client');
const { AUTH_TOKEN } = require('./config');
async function handleProxy(req, res) {
  let body = [];

  req.on('data', chunk => body.push(chunk));
  req.on('end', async () => {
    body = Buffer.concat(body).toString();

    try {
      
      const path = req.url; 
     
      const headers = {
        'content-type': req.headers['content-type'] || 'application/json',
        'authorization': AUTH_TOKEN
      };

      console.log(req.method, path);

      const { response, statusCode } = await sendToHttp2Server(
        req.method,
        path,
        headers,
        body
      );

      console.log(statusCode, path);

      res.writeHead(statusCode, { 'content-type': 'application/json' });
      res.end(response);

    } catch (err) {
      console.error('Proxy error:', err);
      res.writeHead(500, { 'content-type': 'text/plain' });
      res.end('Proxy failed: ' + err.message);
    }
  });
}

module.exports = { handleProxy };
