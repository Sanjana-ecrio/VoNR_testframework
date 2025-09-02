const pino = require('pino');
const path = require('path');
const fs = require("fs");

if (!fs.existsSync("./logs")) {
  fs.mkdirSync("./logs");
}

// destination with sync:true = write immediately
const fileStream = pino.destination({ dest: "./logs/proxy-server.log", sync: true });

// create logger for both console + file
const logger = pino(
  {
    level: "info",
    timestamp: pino.stdTimeFunctions.isoTime,
  },
  pino.multistream([
    { stream: process.stdout }, // console
    { stream: fileStream },     // file
  ])
);


module.exports = logger;
