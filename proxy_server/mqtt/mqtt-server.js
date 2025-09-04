const mqtt = require("mqtt");
const dotenv = require("dotenv");
const logger = require('../logger')
const path = require("path");
const { handleAuthorize } = require('../http2Client');
dotenv.config({
  path: path.resolve(__dirname, "../.env")
});

console.log("ENV ->", {
  broker: process.env.MQTT_BROKER,
  port: process.env.MQTT_PORT,
  topic: process.env.TOPIC,
});

let client = null;

function connect() {
  client = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}:${process.env.MQTT_PORT}`);

  client.on("connect", () => {
    logger.info("MQTT Connection established");
    subscribe();
  });

  client.on("error", (error) => {
    logger.error(`MQTT Error: ${error.message}`);
  });

  client.on("close", () => {
    logger.info("Connection closed");
  });

  client.on("message", async (topic, message) => {
    logger.info(`Message received on ${topic}: ${message.toString()}`);
     
    if (topic === "CommPack/command/authorize") {
      try {
        const payload = JSON.parse(message.toString());
        const response = await handleAuthorize(payload);
        const { requestId } = payload;  

        logger.info({response}, "HTTP2 Server response");
        const mqttResponse = {
          requestId,
          status: "SUCCESS",
          ...response
        };
        logger.info({mqttResponse}, "MQTT Response to be Published")

        // Publish 
        client.publish("CommPack/response/authorize", JSON.stringify(mqttResponse));
        logger.info("Response published to CommPack/response/authorize");
      } catch (err) {
        logger.error(`Error handling authorize: ${err}`);
        const payload = JSON.parse(message.toString());
        // Publish failure response back with requestId if possible
        client.publish("CommPack/response/authorize", JSON.stringify({
          requestId: payload?.requestId || "unknown",
          status: "FAILURE",
          error: err.message,
        }));
      }
    } else {
      logger.info("Unknown command");
    }
  });
}

function subscribe() {
  const topic = process.env.SUBSCRIBE_TOPIC;
  client.subscribe(topic, (err) => {
    if (err) {
      logger.error(`Subscription error: ${err.message}`);
      setTimeout(subscribe, 5000);
    } else {
      logger.info(`Subscribed to ${topic}`);
    }
  });
}

function publish(topic, message) {
  if (!client || !client.connected) {
    logger.info("Client not connected, reconnecting...");
    connect();
    return;
  }

  client.publish(topic, message, (err) => {
    if (err) {
      logger.error(`Error publishing message: ${err.message}`);
    } else {
      logger.info(`Message published to ${topic}: ${message}`);
    }
  });
}

module.exports = { connect, publish };
