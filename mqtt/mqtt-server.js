const mqtt = require("mqtt");
const dotenv = require("dotenv");

dotenv.config();

let client = null;

function connect() {
  client = mqtt.connect(`mqtt://${process.env.MQTT_BROKER}:${process.env.MQTT_PORT}`);

  client.on("connect", () => {
    console.log("MQTT Connection established");
    subscribe();
    const topic = process.env.TOPIC;
    publish(topic, "Message from MQTT server")
  });

  client.on("error", (error) => {
    console.error(`Error: ${error.message}`);
  });

  client.on("close", () => {
    console.log("Connection closed");
  });

  client.on("message", (topic, message) => {
    console.log(`Message received on ${topic}: ${message.toString()}`);
  });
}

function subscribe() {
  const topic = process.env.TOPIC;
  client.subscribe(topic, (err) => {
    if (err) {
      console.error(`Subscription error: ${err.message}`);
      setTimeout(subscribe, 5000);
    } else {
      console.log(`Subscribed to ${topic}`);
    }
  });
}

function publish(topic, message) {
  if (!client || !client.connected) {
    console.log("Client not connected, reconnecting...");
    connect();
    return;
  }

  client.publish(topic, message, (err) => {
    if (err) {
      console.error(`Error publishing message: ${err.message}`);
    } else {
      console.log(`Message published to ${topic}: ${message}`);
    }
  });
}


connect();

module.exports = { connect, publish };
