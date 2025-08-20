const { parseRequestBody } = require('../utils/reqHandler');

async function postEcho(stream) {
  const body = await parseRequestBody(stream);
  stream.respond({ 'content-type': 'application/json', ':status': 200 });
  stream.end(JSON.stringify({ received: body }));
}

module.exports = { postEcho };
