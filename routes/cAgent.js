const express = require("express");
const cAgentController = require("../controllers/cAgentController");
const isAuth = require("../validations/is-Auth");

const router = express.Router();

router.get(
  "/cAgent/dashBoard",
  isAuth.cAgentAuth,
  cAgentController.getCagentDashBoard
);

router.get(
  "/cAgent/createOrder",
  isAuth.cAgentAuth,
  cAgentController.getCaCreateOrder
);

router.post(
  "/cAgent/createOrder",
  isAuth.cAgentAuth,
  cAgentController.postCaCreateOrder
);

router.get(
  "/cAgent/createDagent",
  isAuth.cAgentAuth,
  cAgentController.getDagentCreate
);

router.post(
  "/cAgent/createDagent",
  isAuth.cAgentAuth,
  cAgentController.postDagentCreate
);

router.get(
  "/cAgent/dAgentReq",
  isAuth.cAgentAuth,
  cAgentController.getDagentRequests
);

router.get(
  "/cAgent/approveAgent/:agentId",
  isAuth.cAgentAuth,
  cAgentController.getDagentCreate
);

router.get(
  "/cAgent/callHistory",
  isAuth.cAgentAuth,
  cAgentController.getCallHistory
);

router.post(
  "/cAgent/callHistory",
  isAuth.cAgentAuth,
  cAgentController.postCallHistory
);

router.get(
  "/cAgent/modify/order",
  isAuth.cAgentAuth,
  cAgentController.getModifyOrder
);

router.post(
  "/cAgent/modifyOrder",
  isAuth.cAgentAuth,
  cAgentController.postModifyOrder
);

router.post(
  "/cAgent/confirm/orderModify",
  isAuth.cAgentAuth,
  cAgentController.postConfirmModifyOrder
);

router.get(
  "/reports/cAgent/dAgentPackages",
  isAuth.cAgentAuth,
  cAgentController.getCaDagentPackagesReport
);

router.post(
  "/cAgent/getAgents",
  isAuth.cAgentAuth,
  cAgentController.postGetAgentsNames
);

router.post(
  "/reports/cAgent/dAgentPackages",
  isAuth.cAgentAuth,
  cAgentController.postCaDagentPackagesReport
);

router.get(
  "/reports/cAgent/sellerPkgs",
  isAuth.cAgentAuth,
  cAgentController.getCaSellerPackages
);

router.post(
  "/reports/cAgent/sellerPkgs",
  isAuth.cAgentAuth,
  cAgentController.postCaSellerPackagesReport
);

module.exports = router;
