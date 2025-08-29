async function getStatus(stream) {
  stream.respond({ ':status': 200, 'content-type': 'application/json' });
  stream.end(JSON.stringify({ message: 'OK' }));
}

module.exports = { getStatus };
