const http2 = require("http2");
const dotenv = require("dotenv");
const fs = require("fs");
const path = require("path");
const config = require('./config');

const logger = require('./logger');


function createHttp2Client(sbiEndpoint) {
  let url;
  let options = {};

  if (config.SECURED_SBI) {
    url = `https://${sbiEndpoint}`;
    options = {
      rejectUnauthorized: false,
      ca: fs.existsSync(config.SBI_ENDPOINT_CERT)
        ? fs.readFileSync(config.SBI_ENDPOINT_CERT)
        : undefined,
    };
  } else {
    url = `http://${sbiEndpoint}`;
    options = {};
  }

  return http2.connect(url, options);
}



async function sendToHttp2Server(method, url, path, headers = {}, body = "") {
  return new Promise((resolve, reject) => {

    const client = http2.connect(url,  {
      rejectUnauthorized: false, // trust self-signed certificate
    });
    console.log("MAin server", client)
    client.on("error", (err) => {
      logger.error("HTTP/2 connection error:", err);
      reject(err);
    });

    const req = client.request({
      ":method": method,
      ":path": path,
      ...headers,
    });

    let data = [];
    req.on("data", (chunk) => data.push(chunk));
    req.on("end", () => {
      client.close();
      resolve({
        response: Buffer.concat(data).toString(),
        statusCode: req.rstCode || 200,
      });
    });

    if (body && method !== "GET") {
      req.write(body);
    }

    req.end();
  });
}


async function handleAuthorize(payload) {
  const client = createHttp2Client(config.SBI_UDM_ENDPOINT);

  if (!payload.ueImpu) {
    throw new Error("Missing required fields for getProfileData");
  }

  const path = `/nhss-ims-uecm/v1/impu-${encodeURIComponent(payload.ueImpu)}/authorize`;

  const req = client.request({
    ":method": "POST",
    ":path": path,
    "content-type": "application/json",
  });

  logger.info({ path }, "HTTP request path");

  const body = JSON.stringify({
    impi: payload.impi,
    authorizationType: payload.authorizationType,
    visitedNetworkIdentifier: payload.visitedNetworkIdentifier,
  });

  logger.info({ body }, "HTTP Request body");

  req.write(body);
  req.end();

  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      client.close();
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error("Invalid JSON response: " + err.message));
      }
    });

    req.on("error", (err) => {
      client.close();
      reject(new Error("Authorization server request failed: " + err.message));
    });

    client.on("error", (err) => {
      client.close();
      reject(new Error("Authorization server connection failed: " + err.message));
    });

    req.setTimeout(5000, () => {
      req.close();
      client.close();
      reject(new Error("Authorization server timeout"));
    });
  });
}


async function handleGenerateSipAuth(payload) {
  const client = createHttp2Client(config.SBI_UDM_ENDPOINT);

  if (!payload.ueImpu) {
    throw new Error("Missing required fields for getProfileData");
  }
  const path = `/nhss-ims-ueau/v1/impu-${encodeURIComponent(payload.ueImpu)}/security-information/generate-sip-auth-data`;

  const req = client.request({
    ":method": "POST",
    ":path": path,
    "content-type": "application/json",
  });

  if (!payload.cscfServerName || !payload.sipAuthenticationScheme || !payload.sipNumberAuthItems) {
    throw new Error("Missing required fields for generateSipAuth");
  }

  const body = JSON.stringify({
    cscfServerName: payload.cscfServerName,
    sipAuthenticationScheme: payload.sipAuthenticationScheme,
    sipNumberAuthItems: payload.sipNumberAuthItems,
  });

  req.write(body);
  req.end();

  return new Promise((resolve, reject) => {
    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      client.close();
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error("Invalid JSON response: " + err.message));
      }
    });

    req.on("error", (err) => {
      client.close();
      reject(new Error("Authorization server request failed: " + err.message));
    });

    client.on("error", (err) => {
      client.close();
      reject(new Error("Authorization server connection failed: " + err.message));
    });

    req.setTimeout(5000, () => {
      req.close();
      client.close();
      reject(new Error("Authorization server timeout"));
    });
  });
}

// async function handleScscfRegidtration(payload) {
//   const client = createHttp2Client(config.SBI_UDM_ENDPOINT);
//   if (!payload.ueImpu) {
//     throw new Error("Missing required fields for getProfileData");
//   }

//   const path = `/nhss-ims-uecm/v1/impu-${encodeURIComponent(payload.ueImpu)}/scscf-registration`
//   const req = client.request({
//     ":method": "PUT",
//     ":path": path,
//     "content-type": "application/json",
//   });

//   if (!payload.cscfServerName || !payload.imsRegistrationType || !payload.scscfInstanceId) {
//     throw new Error("Missing required fields for scscf-registration");
//   }

//   const body = JSON.stringify({
//     cscfServerName: payload.cscfServerName,
//     imsRegistrationType: payload.imsRegistrationType,
//     scscfInstanceId: payload.scscfInstanceId,
//   });

//   req.write(body);
//   req.end();

//   return new Promise((resolve, reject) => {
//     let data = "";

//     req.on("data", (chunk) => {
//       data += chunk;
//     });

//     req.on("end", () => {
//       client.close();
//       try {
//         resolve(JSON.parse(data));
//       } catch (err) {
//         reject(new Error("Invalid JSON response: " + err.message));
//       }
//     });

//     req.on("error", (err) => {
//       client.close();
//       reject(new Error("Authorization server request failed: " + err.message));
//     });

//     client.on("error", (err) => {
//       client.close();
//       reject(new Error("Authorization server connection failed: " + err.message));
//     });

//     req.setTimeout(5000, () => {
//       req.close();
//       client.close();
//       reject(new Error("Authorization server timeout"));
//     });
//   });
// }

async function handleScscfRegidtration(payload) {
  return new Promise((resolve, reject) => {
    const client = createHttp2Client(config.SBI_UDM_ENDPOINT);

    if (!payload.ueImpu) {
      return reject(new Error("Missing required fields for scscf-registration"));
    }

    const path = `/nhss-ims-uecm/v1/impu-${encodeURIComponent(payload.ueImpu)}/scscf-registration`;
    const req = client.request({
      ":method": "PUT",
      ":path": path,
      "content-type": "application/json",
    });

    if (!payload.cscfServerName || !payload.imsRegistrationType || !payload.scscfInstanceId) {
      return reject(new Error("Missing required fields for scscf-registration"));
    }

    const body = JSON.stringify({
      cscfServerName: payload.cscfServerName,
      imsRegistrationType: payload.imsRegistrationType,
      scscfInstanceId: payload.scscfInstanceId,
    });

    req.write(body);
    req.end();

    let data = "";

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      client.close();
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error("Invalid JSON response: " + err.message));
      }
    });

    req.on("error", (err) => {
      client.close();
      reject(new Error("S-CSCF request failed: " + err.message));
    });

    client.on("error", (err) => {
      client.close();
      reject(new Error("S-CSCF connection failed: " + err.message));
    });

    req.setTimeout(5000, () => {
      req.close();
      client.close();
      reject(new Error("S-CSCF request timeout"));
    });
  });
}

async function handleGetProfileData(payload) {
  return new Promise((resolve, reject) => {
    if (!payload.ueImpu) {
      return reject(new Error("Missing required fields for getProfileData"));
    }

    const path = `/nhss-ims-sdm/v1/impu-${encodeURIComponent(payload.ueImpu)}/ims-data/profile-data`;
    const client = createHttp2Client(config.SBI_UDM_ENDPOINT);

    const req = client.request({
      ":method": payload.method || "GET",
      ":path": path,
      ...(payload.headers || { Accept: "application/json" }),
    });

    let data = "";

    req.on("response", (headers) => {
      logger.info({ headers }, "Response headers from profile-data");
    });

    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      client.close();
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error("Invalid JSON response: " + err.message));
      }
    });

    req.on("error", (err) => {
      client.close();
      reject(new Error("ProfileData request failed: " + err.message));
    });

    client.on("error", (err) => {
      client.close();
      reject(new Error("ProfileData connection failed: " + err.message));
    });

    req.setTimeout(5000, () => {
      req.close();
      client.close();
      reject(new Error("ProfileData request timeout"));
    });

    // For GET, don’t send a body
    req.end();
  });
}




async function handleAppSession(payload) {
  const client = createHttp2Client(config.SBI_PCF_ENDPOINT);

  const path = `/npcf-policyauthorization/v1/app-sessions`;
  const req = client.request({
    ":method": "POST",
    ":path": path,
    "content-type": "application/json",
  });

  if (!payload.ascReqData) {
    throw new Error("Missing required fields for app-session");
  }

  const body = JSON.stringify({ ascReqData: payload.ascReqData });
  req.write(body);
  req.end();

  return new Promise((resolve, reject) => {
    let data = "";
    let statusCode;

    // Capture status from headers
    req.on("response", (headers) => {
      statusCode = headers[":status"];
      console.log("response headers:", headers);
    });
    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      client.close();
      try {
        const parsed = data ? JSON.parse(data) : null;
        resolve({
          statusCode,
          body: parsed,
        });
      } catch (err) {
        reject(new Error("Invalid JSON response: " + err.message));
      }
    });

    req.on("error", (err) => {
      client.close();
      reject(new Error("Authorization server request failed: " + err.message));
    });

    client.on("error", (err) => {
      client.close();
      reject(new Error("Authorization server connection failed: " + err.message));
    });

    req.setTimeout(5000, () => {
      req.close();
      client.close();
      reject(new Error("Authorization server timeout"));
    });
  });
}



async function handleModAppSession(payload) {
  if (!payload.sbiEndpoint || !payload.ascReqData) {
    throw new Error("Missing required fields for modAppSession");
  }
  
  const client = createHttp2Client(config.SBI_PCF_ENDPOINT);

  const method = payload.httpMethod || "PATCH"
  const path = payload.sbiEndpoint;
  const req = client.request({
    ":method": method,
    ":path": path,
    "content-type": "application/json",
  });

  if (!payload.ascReqData) {
    throw new Error("Missing required fields for app-session");
  }

  const body = JSON.stringify({ ascReqData: payload.ascReqData });
req.write(body);
  req.end();

  return new Promise((resolve, reject) => {
    let data = "";
    let statusCode;

    req.on("response", (headers) => {
      statusCode = headers[":status"];
      console.log("response headers:", headers);
    });
    req.on("data", (chunk) => {
      data += chunk;
    });

    req.on("end", () => {
      client.close();
      try {
        resolve(JSON.parse(data));
      } catch (err) {
        reject(new Error("Invalid JSON response: " + err.message));
      }
    });

    req.on("error", (err) => {
      client.close();
      reject(new Error("Authorization server request failed: " + err.message));
    });

    client.on("error", (err) => {
      client.close();
      reject(new Error("Authorization server connection failed: " + err.message));
    });

    req.setTimeout(5000, () => {
      req.close();
      client.close();
      reject(new Error("Authorization server timeout"));
    });
  });
}




module.exports = { handleAuthorize , sendToHttp2Server, handleGenerateSipAuth, handleGetProfileData, handleScscfRegidtration, handleAppSession, handleModAppSession};
