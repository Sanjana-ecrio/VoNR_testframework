const mqtt = require("mqtt");
const dotenv = require("dotenv");
const logger = require("../logger");
const path = require("path");
const { handleAuthorize, handleGenerateSipAuth, handleScscfRegidtration, handleGetProfileData, handleAppSession, handleModAppSession} = require("../http2Client");
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

console.log("ENV ->", {
  broker: process.env.MQTT_BROKER,
  port: process.env.MQTT_PORT,
  topic: process.env.TOPIC,
});

let client = null;

function connect() {
  client = mqtt.connect(
    `mqtt://${process.env.MQTT_BROKER}:${process.env.MQTT_PORT}`
  );

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

        logger.info({ response }, "HTTP2 Server response");
        const mqttResponse = {
          requestId,
          ...response,
        };
        logger.info({ mqttResponse }, "MQTT Response to be Published");

 
        client.publish(
          "CommPack/response/authorize",
          JSON.stringify(mqttResponse)
        );
        logger.info("Response published to CommPack/response/authorize");
      } catch (err) {
        logger.error(`Error handling authorize: ${err}`);
        const payload = JSON.parse(message.toString());
        client.publish(
          "CommPack/response/authorize",
          JSON.stringify({
            requestId: payload?.requestId || "unknown",
            status: "FAILURE",
            error: err.message,
          })
        );
      }
    } else if (topic === "CommPack/command/generateSipAuth") {
      try {
        const payload = JSON.parse(message.toString());
        const response = await handleGenerateSipAuth(payload);
        const { requestId } = payload;

        const mqttResponse = {
          requestId,
          ...response,
        };

        client.publish(
          "CommPack/response/generateSipAuth",
          JSON.stringify(mqttResponse)
        );
        logger.info(
          { mqttResponse },
          "MQTT Response published for generateSipAuth"
        );
      } catch (err) {
        logger.error(`Error handling generateSipAuth: ${err}`);
        const payload = JSON.parse(message.toString());
        client.publish(
          "CommPack/response/generateSipAuth",
          JSON.stringify({
            requestId: payload?.requestId || "unknown",
            status: "FAILURE",
            errorMessage: err.message,
          })
        );
      }
    } else if (topic === "CommPack/command/scscfRegistration") {
      try {
        const payload = JSON.parse(message.toString());
        const response = await handleScscfRegidtration(payload); 
        const { requestId } = payload;

        const mqttResponse = {
          requestId,
          ...response,
        };

        client.publish(
          "CommPack/response/scscfRegistration",
          JSON.stringify(mqttResponse)
        );
        logger.info(
          { mqttResponse },
          "MQTT Response published for scscfRegistration"
        );
      } catch (err) {
        logger.error(`Error handling scscfRegistration: ${err}`);
        const payload = JSON.parse(message.toString());
        client.publish(
          "CommPack/response/scscfRegistration",
          JSON.stringify({
            requestId: payload?.requestId || "unknown",
            status: "FAILURE",
            errorMessage: err.message,
          })
        );
      }
    } else if (topic === "commPack/command/getProfileData") {
  try {
    const payload = JSON.parse(message.toString());
    const response = await handleGetProfileData(payload);
    const { correlationId, replyTo } = payload;

    const mqttResponse = {
      type: "SBI_RESPONSE",
      correlationId: correlationId || "unknown",
      status: response?.status || 200,
      body: response?.body || response,
    };

    const replyTopic = replyTo || "commPack/response/nhss-ims-sdm/profile-data";
    client.publish(replyTopic, JSON.stringify(mqttResponse));

    logger.info(
      { mqttResponse, replyTopic },
      "MQTT Response published for getProfileData"
    );
  } catch (err) {
    logger.error(`Error handling getProfileData: ${err}`);
    const payload = JSON.parse(message.toString());

    const errorResponse = {
      type: "SBI_RESPONSE",
      correlationId: payload?.correlationId || "unknown",
      status: "FAILURE",
      errorMessage: err.message,
    };

    const replyTopic = payload.replyTo || "commPack/response/nhss-ims-sdm/profile-data";
    client.publish(replyTopic, JSON.stringify(errorResponse));
  } 
} else if (topic === "CommPack/command/createAppSession") {
  try {
    const payload = JSON.parse(message.toString());
    const response = await handleAppSession(payload); 
    const requestId = payload.requestId;
    const mqttResponse = {
      requestId,
      ...response,
    };

    client.publish(
      "CommPack/response/createAppSession",
      JSON.stringify(mqttResponse)
    );
    logger.info(
      { mqttResponse },
      "MQTT Response published for createAppSession"
    );
  } catch (err) {
    logger.error(`Error handling createAppSession: ${err}`);
    const payload = JSON.parse(message.toString());
    client.publish(
      "CommPack/response/createAppSession",
      JSON.stringify({
        requestId: payload?.requestId || "unknown",
        status: "FAILURE",
        errorMessage: err.message,
      })
    );
  }
  } else if (topic === "CommPack/command/modAppSession") {
  try {
    const payload = JSON.parse(message.toString());
    const response = await handleModAppSession(payload);
    const { requestId } = payload;

    const mqttResponse = {
      requestId,
      status: 200,
      ...response,
    };

    client.publish(
      "CommPack/response/modAppSession",
      JSON.stringify(mqttResponse)
    );
    logger.info(
      { mqttResponse },
      "MQTT Response published for modAppSession"
    );
  } catch (err) {
    logger.error(`Error handling modAppSession: ${err}`);
    const payload = JSON.parse(message.toString());
    client.publish(
      "CommPack/response/modAppSession",
      JSON.stringify({
        requestId: payload?.requestId || "unknown",
        status: "FAILURE",
        errorMessage: err.message,
      })
    );
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
