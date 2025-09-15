const mqtt = require("mqtt");
const dotenv = require("dotenv");
const logger = require("../logger");
const path = require("path");
const config = require("../config");
const mqttTopics = require("./topics");
const {
  handleAuthorize,
  handleGenerateSipAuth,
  handleScscfRegidtration,
  handleGetProfileData,
  handleAppSession,
  handleModAppSession,
} = require("../http2Client");
dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

console.log("ENV ->", {
  broker: config.MQTT_BROKER,
  port: config.MQTT_PORT,
  topic: mqttTopics.TOPIC,
});

let client = null;

function publishFailureResponse(
  mqttClient,
  topic,
  payload,
  err,
  extraFields = {}
) {
  let errorCode = payload?.errorCode || 500;
  let errorMsg = err?.message || "Unknown error";

  if (
    err?.code === "ECONNREFUSED" ||
    err?.message?.includes("connection failed")
  ) {
    errorCode = 503;
    errorMsg = "Server unreachable";
  } else if (err?.message?.includes("timeout")) {
    errorCode = 504;
    errorMsg = "Server timeout";
  } else if (err?.message?.includes("request failed")) {
    errorCode = 502;
    errorMsg = "Request failed";
  }

  const errorResponse = {
    requestId: payload?.requestId || "unknown",
    status: "FAILURE",
    errorCode,
    errorMessage: errorMsg,
    ...extraFields,
  };

  mqttClient.publish(topic, JSON.stringify(errorResponse));
  logger.error({ errorResponse }, `Published FAILURE response to ${topic}`);
}

function connect() {
  client = mqtt.connect(`mqtt://${config.MQTT_BROKER}:${config.MQTT_PORT}`);

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

    if (topic === mqttTopics.TOPIC_CMD_AUTHORIZE) {
      try {
        const payload = JSON.parse(message.toString());
        const response = await handleAuthorize(payload);
        const requestId = payload.requestId;

        logger.info({ payload }, "Payload from MQTT");
        const mqttResponse = {
          requestId: requestId,
          ...response,
        };
        logger.info({ mqttResponse }, "MQTT Response to be Published");

        client.publish(
          mqttTopics.TOPIC_RESP_AUTHORIZE,
          JSON.stringify(mqttResponse)
        );
        logger.info("Response published to CommPack/response/authorize");
      } catch (err) {
        logger.error(`Error handling authorize: ${err.message}`);
        const payload = JSON.parse(message.toString());
        publishFailureResponse(
          client,
          mqttTopics.TOPIC_RESP_AUTHORIZE,
          payload,
          err
        );
      }
    } else if (topic === mqttTopics.TOPIC_CMD_SIP_GENERATE) {
      try {
        const payload = JSON.parse(message.toString());
        const response = await handleGenerateSipAuth(payload);
        const requestId = payload?.requestId;

        const mqttResponse = {
          requestId: requestId,
          ...response,
        };

        client.publish(
          mqttTopics.TOPIC_RESP_SIP_GENERATE,
          JSON.stringify(mqttResponse)
        );
        logger.info(
          { mqttResponse },
          "MQTT Response published for generateSipAuth"
        );
      } catch (err) {
        logger.error(`Error handling generateSipAuth: ${err}`);
        const payload = JSON.parse(message.toString());
        publishFailureResponse(
          client,
          mqttTopics.TOPIC_RESP_SIP_GENERATE,
          payload,
          err
        );
      }
    } else if (topic === mqttTopics.TOPIC_CMD_SIP_REGISTRATION) {
      try {
        const payload = JSON.parse(message.toString());
        const response = await handleScscfRegidtration(payload);
        const requestId = payload?.requestId;
        const status = response.statusCode;

        const mqttResponse = {
          requestId: requestId,
          status: status,
          ...response,
        };

        client.publish(
          mqttTopics.TOPIC_RESP_SIP_REGISTRATION,
          JSON.stringify(mqttResponse)
        );
        logger.info(
          { mqttResponse },
          "MQTT Response published for scscfRegistration"
        );
      } catch (err) {
        logger.error(`Error handling scscfRegistration: ${err}`);
        const payload = JSON.parse(message.toString());
        publishFailureResponse(
          client,
          mqttTopics.TOPIC_RESP_SIP_REGISTRATION,
          payload,
          err
        );
      }
    } else if (topic === mqttTopics.TOPIC_CMD_PROFILEDATA) {
      try {
        const payload = JSON.parse(message.toString());
        const response = await handleGetProfileData(payload);
        const requestId = payload?.requestId;
        const correlationId = payload?.correlationId;
        const replyTo = payload?.replyTo;

        logger.info({ payload }, "Received Payload:");
        const mqttResponse = {
          requestId: requestId,
          type: "SBI_RESPONSE",
          correlationId: correlationId || "unknown",
          status: response?.status || 200,
          body: response?.body || response,
        };

        const replyTopic = replyTo || mqttTopics.TOPIC_RESP_PROFILEDATA;
        client.publish(replyTopic, JSON.stringify(mqttResponse));

        logger.info(
          { mqttResponse, replyTopic },
          "MQTT Response published for getProfileData"
        );
      } catch (err) {
        logger.error(`Error handling getProfileData: ${err}`);
        const payload = JSON.parse(message.toString());
        const replyTopic =
          payload.replyTo || mqttTopics.TOPIC_RESP_PROFILEDATA;
        publishFailureResponse(client, replyTopic, payload, err);
      }
    } else if (topic === mqttTopics.TOPIC_CMD_CREATE_APPSESSION) {
      try {
        const payload = JSON.parse(message.toString());
        const response = await handleAppSession(payload);
        const requestId = payload?.requestId;
        const status = response.statusCode;

        const mqttResponse = {
          requestId: requestId,
          status: status,
          ...response.body,
        };
        client.publish(
          mqttTopics.TOPIC_RESP_CREATE_APPSESSION,
          JSON.stringify(mqttResponse)
        );
        logger.info({ response }, "Response from HTTP2 createAppSession");
        logger.info(
          { mqttResponse },
          "MQTT Response published for createAppSession"
        );
      } catch (err) {
        logger.error(`Error handling createAppSession: ${err}`);
        const payload = JSON.parse(message.toString());
        publishFailureResponse(
          client,
          mqttTopics.TOPIC_RESP_CREATE_APPSESSION,
          payload,
          err
        );
      }
    } else if (topic === mqttTopics.TOPIC_CMD_MOD_APPSESSION) {
      try {
        const payload = JSON.parse(message.toString());
        const response = await handleModAppSession(payload);
        const requestId = payload?.requestId;

        const mqttResponse = {
          requestId: requestId,
          ...response,
        };

        client.publish(
          mqttTopics.TOPIC_RESP_MOD_APPSESSION,
          JSON.stringify(mqttResponse)
        );
        logger.info(
          { mqttResponse },
          "MQTT Response published for modAppSession"
        );
      } catch (err) {
        logger.error(`Error handling modAppSession: ${err}`);
        const payload = JSON.parse(message.toString());
        publishFailureResponse(client, mqttTopics.TOPIC_RESP_MOD_APPSESSION, payload, err);
      }
    } else {
      logger.info("Unknown command");
    }
  });
}

function subscribe() {
  const topic = mqttTopics.SUBSCRIBE_TOPIC;
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
