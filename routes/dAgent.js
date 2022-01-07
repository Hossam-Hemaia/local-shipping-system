const express = require("express");
const dAgentController = require("../controllers/dAgentController");
const isAuth = require("../validations/is-Auth");

const router = express.Router();

router.get(
  "/dAgent/dashBoard",
  isAuth.dAgentAuth,
  dAgentController.getDagentDashBoard
);

router.get(
  "/dAgent/receiveOrder/:dOrderId",
  isAuth.dAgentAuth,
  dAgentController.getReceiveDorder
);

router.post(
  "/dAgent/returnPackage",
  isAuth.dAgentAuth,
  dAgentController.postReturnPackage
);

router.post(
  "/dAgent/acceptOrder",
  isAuth.dAgentAuth,
  dAgentController.postDagentAcceptOrder
);

router.get(
  "/dAgent/yourPackages",
  isAuth.dAgentAuth,
  dAgentController.getYourPackages
);

router.get(
  "/dAgent/deliverPackage",
  isAuth.dAgentAuth,
  dAgentController.getDeliverPackage
);

router.post(
  "/dAgent/packageData",
  isAuth.dAgentAuth,
  dAgentController.getPackageData
);

router.post(
  "/dAgent/packageStatus",
  isAuth.dAgentAuth,
  dAgentController.postPackageStatus
);

router.get(
  "/dAgent/reverseOrder",
  isAuth.dAgentAuth,
  dAgentController.getReversedPackages
);

router.post(
  "/dAgent/createRevOrder",
  isAuth.dAgentAuth,
  dAgentController.postCreateReversedOrder
);

module.exports = router;
