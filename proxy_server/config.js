module.exports = {
  PORT: 4000, 
  SBI_ENDPOINT: "192.168.56.1:3000",
  SECURED_SBI: false, // true = TLS-https, false = cleartext-http
  AUTH_TOKEN: "Bearer abc123456789",
  PATH_REWRITE: {
    "^/api/****": "/v1/",
    "^/api/***": "/v2/"
  },
  SBI_ENDPOINT_CERT: "../server/server.crt",
  MQTT_BROKER: "192.168.56.1",
  MQTT_PORT: 25883,
};
  
