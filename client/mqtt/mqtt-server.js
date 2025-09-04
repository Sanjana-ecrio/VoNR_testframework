const mqtt = require("mqtt");
const dotenv = require("dotenv");
const logger = require('../logger')
const path = require("path");
dotenv.config({ path: require("path").resolve(__dirname, ".env") });


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
    const topic = process.env.TOPIC;
    publish(topic, "Message from MQTT server")
  });

  client.on("error", (error) => {
    logger.error(`MQTT Error: ${error.message}`);
  });

  client.on("close", () => {
    logger.info("Connection closed");
  });

  client.on("message", (topic, message) => {
    logger.info(`Message received on ${topic}: ${message.toString()}`);
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
