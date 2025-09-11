module.exports = {
  PORT: 4000, 
  SBI_ENDPOINT: "https://localhost:3000",
  AUTH_TOKEN: "Bearer abc123456789",
  PATH_REWRITE: {
    "^/api/****": "/v1/",
    "^/api/***": "/v2/"
  },
  SBI_ENDPOINT_CERT: "../server/server.crt",
  MQTT_BROKER: "192.168.56.1",
  MQTT_PORT: 25883,
};
  
