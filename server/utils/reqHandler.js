function parseRequestBody(stream) {
  return new Promise((resolve) => {
    let body = [];
    stream.on('data', chunk => body.push(chunk));
    stream.on('end', () => resolve(Buffer.concat(body).toString()));
  });
}

module.exports = { parseRequestBody };
