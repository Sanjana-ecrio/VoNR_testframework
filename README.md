# VoNR_testframework
 HTTP2-based (With TLS) server-client test framework  to build APIs for testing VoNR interfaces


# Pre-requisites:
-> Node version
  node -v 
  v18.20.8<br>
-> openssl


# Generate private key
openssl genrsa -out server.key 2048

# Generate self-signed certificate
openssl req -new -x509 -key server.key -out server.crt -days 365 -subj "/C=CA/ST=Ontario/L=Waterloo/O=VoNRTesting/OU=Dev/CN=localhost"

# Run commands
-> Run server:
  path: server/server.js<br>
-> Run client:
  path: client/client.js

# To add a new API handler in Server
Create controller file in controllers/.<br>
Write handler function<br>
Use parseRequestBody for POST data.<br>
Register route dynamically with apiRoutes.register('METHOD', '/path', handler).<br>
Test endpoint using client.js or curl.<br>

# To add a new API handler in Client
Create a controller on server (if endpoint doesn’t exist)<br>
Register route dynamically using apiRoutes.register('METHOD', '/path', handler) in client.js<br>
Create a client endpoint module in client/endpoints/<br>
Import it in client.js and call the function<br>
Run node client.js to test<br>
