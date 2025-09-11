const authorizeController = require('../controllers/authorize');
const generateSipAuthController = require('../controllers/generateSipAuth');
const scscfRegistrationController = require('../controllers/scscfregistration');
const profileDataController = require('../controllers/profiledata');
const appSessionsController = require("../controllers/appSessions");
const modAppSessionController = require("../controllers/modappSessions")
const logger = require('../utils/logger');

const routes = [
  {
    method: 'POST',
    pathRegex: /^\/nhss-ims-uecm\/v1\/impu-[^\/]+\/authorize$/,
    controller: authorizeController.authorizeUE
  },
  {
    method: 'POST',
    pathRegex: /^\/nhss-ims-ueau\/v1\/impu[^\/]+\/security-information\/generate-sip-auth-data$/,
    controller: generateSipAuthController.generateSipAuth
  },
  {
    method: 'PATCH',
    pathRegex: /^\/npcf-policyauthorization\/v1\/app-sessions\/appSess-imsi-[0-9]+-[0-9]+$/,
    controller: modAppSessionController.modAppSession
  },
  {
    method: 'PUT',
    pathRegex: /^\/nhss-ims-uecm\/v1\/impu-[^\/]+\/scscf-registration$/,
    controller: scscfRegistrationController.scscfRegistration
  },
  {
    method: 'GET',
    pathRegex: /^\/nhss-ims-sdm\/v1\/impu-[^\/]+\/ims-data\/profile-data$/,
    controller: profileDataController.getProfileData
  },
  {
  method: "POST",
  pathRegex: /^\/npcf-policyauthorization\/v1\/app-sessions$/,
  controller: appSessionsController.createAppSession,
},
];

async function handleRequest(stream, method, path, headers, body) {
  try {
    const route = routes.find(r => r.method === method && r.pathRegex.test(path));

    if (!route) {
      stream.respond({ ':status': 404, 'content-type': 'application/json' });
      stream.end(JSON.stringify({ error: 'Not Found', path }));
      return;
    }

    let parsedBody = null;
    if (body) {
      try {
        parsedBody = JSON.parse(body);
      } catch {
        parsedBody = body;
      }
    }

    const impuMatch = path.match(/impu-([^\/]+)/);
    if (impuMatch) {
      parsedBody = { ...parsedBody, impuFromPath: decodeURIComponent(impuMatch[1]) };
    }

    const impiMatch = path.match(/impi([^\/@]+@[^\/]+)/);
    if (impiMatch) {
      parsedBody = { ...parsedBody, impiFromPath: decodeURIComponent(impiMatch[1]) };
    }

    await route.controller(stream, headers, parsedBody);
  } catch (err) {
    logger.error({ err }, 'Error in route handling');
    stream.respond({ ':status': 500, 'content-type': 'application/json' });
    stream.end(JSON.stringify({ error: 'Internal Server Error' }));
  }
}

module.exports = { handleRequest };
