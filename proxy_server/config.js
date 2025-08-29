module.exports = {
  PORT: 4000, 
  MAIN_SERVER: "https://localhost:3000",
  AUTH_TOKEN: "Bearer abc123456789",
  PATH_REWRITE: {
    "^/api/****": "/v1/",
    "^/api/***": "/v2/"
  },
  MAIN_SERVER_CERT: "../server/server.crt"
};
  
