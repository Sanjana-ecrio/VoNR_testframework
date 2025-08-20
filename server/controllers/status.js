async function getStatus(stream) {
  stream.respond({ 'content-type': 'application/json', ':status': 200 });
  stream.end(JSON.stringify({ status: 'ok', timestamp: new Date() }));
}

module.exports = { getStatus };
