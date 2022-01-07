const express = require("express");
const secController = require("../controllers/securityController");
const isAuth = require("../validations/is-Auth");

const router = express.Router();

router.get(
  "/secAgent/dashBoard",
  isAuth.secAgentAuth,
  secController.getSecurtiyDashboard
);

router.get(
  "/secAgent/security",
  isAuth.secAgentAuth,
  secController.getSecurity
);

router.get(
  "/secAgent/security/:type",
  isAuth.secAgentAuth,
  secController.getSecurity
);

router.post(
  "/secAgent/security",
  isAuth.secAgentAuth,
  secController.postSecurity
);

router.post(
  "/secAgent/security/checkPackages",
  isAuth.secAgentAuth,
  secController.postSecurityCheckPackages
);

router.post(
  "/secAgent/security/checkPassed",
  isAuth.secAgentAuth,
  secController.postSecAgentCheckPassed
);

module.exports = router;
