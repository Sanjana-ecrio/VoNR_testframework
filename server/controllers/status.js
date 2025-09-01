async function getStatus(stream) {
  stream.respond({ ':status': 200, 'content-type': 'application/json' });
  stream.end(JSON.stringify({ message: 'Hello from Main Server' }));
}

async function postStatus(stream, headers, body) {
  console.log("Body inside statusController:", body);

  let responseMessage;

  if (typeof body === "string") {
    responseMessage = body + " received to server";
  } else if (typeof body === "object" && body !== null) {
    responseMessage = { ...body, serverMessage: "received to server" };
  } else {
    responseMessage = "No body received, but request reached server";
  }

  stream.respond({ ':status': 200, 'content-type': 'application/json' });
  stream.end(JSON.stringify({
    status: "ok",
    response: responseMessage
  }));
}
module.exports = { getStatus, postStatus };
