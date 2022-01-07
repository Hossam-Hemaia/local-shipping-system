const express = require("express");
const rAgentController = require("../controllers/rAgentController");
const isAuth = require("../validations/is-Auth");

const router = express.Router();

router.get(
  "/rAgent/dashBoard",
  isAuth.rAgentAuth,
  rAgentController.getRagentDashBoard
);

router.get(
  "/rAgent/orderDetails/:orderId/:sellerName",
  isAuth.rAgentAuth,
  rAgentController.getPrintOrderDetails
);

router.get(
  "/rAgent/rOrderDetails/:rOrderId/:region",
  isAuth.rAgentAuth,
  rAgentController.getPrintRorderDetails
);

router.get(
  "/rAgent/receiveOrder/:orderId",
  isAuth.rAgentAuth,
  rAgentController.getRagentReceiveOrders
);

router.get(
  "/rAgent/receiverOrder/:rOrderId",
  isAuth.rAgentAuth,
  rAgentController.getRagentReceiveRorders
);

router.post(
  "/rAgent/checkPackage",
  isAuth.rAgentAuth,
  rAgentController.postCheckPackage
);

router.post(
  "/rAgent/createPackage",
  isAuth.rAgentAuth,
  rAgentController.postCreatePackage
);

router.post(
  "/rAgent/printPolicy",
  isAuth.rAgentAuth,
  rAgentController.postPrintPolicy
);

router.post(
  "/rAgent/confirmOrder",
  isAuth.rAgentAuth,
  rAgentController.postConfirmOrder
);

router.post(
  "/rAgent/confirmrOrder",
  isAuth.rAgentAuth,
  rAgentController.postConfirmRorder
);

router.get(
  "/rAgent/localDispatch",
  isAuth.rAgentAuth,
  rAgentController.getLocalDispatch
);

router.post(
  "/dAgent/assign",
  isAuth.rAgentAuth,
  rAgentController.postDagentAssignLocal
);

router.get(
  "/rAgent/reversedPackages",
  isAuth.rAgentAuth,
  rAgentController.getLocalRejectedPackages
);

router.get(
  "/rAgent/regionsDispatch",
  isAuth.rAgentAuth,
  rAgentController.getRegionsDispatch
);

router.post(
  "/rAgent/rOrdersAssign",
  isAuth.rAgentAuth,
  rAgentController.postDagentAssignRegions
);

router.get(
  "/rAgent/createOrder",
  isAuth.rAgentAuth,
  rAgentController.getCreateOrder
);

router.post(
  "/rAgent/createOrder",
  isAuth.rAgentAuth,
  rAgentController.postCreateOrder
);

router.get(
  "/rAgent/createDagent",
  isAuth.rAgentAuth,
  rAgentController.getRaDagentCreate
);

router.post(
  "/rAgent/createDagent",
  isAuth.rAgentAuth,
  rAgentController.postRaDagentCreate
);

router.get(
  "/rAgent/receiverevOrder/:revOrderId",
  isAuth.rAgentAuth,
  rAgentController.getReceiveRevOrder
);

router.post(
  "/rAgent/confirmrevOrder",
  isAuth.rAgentAuth,
  rAgentController.postConfirmRevOrder
);

router.post(
  "/rAgent/dropPackage",
  isAuth.rAgentAuth,
  rAgentController.postDropPackage
);

router.get(
  "/reports/returnedToSeller",
  isAuth.rAgentAuth,
  rAgentController.getRaReturnedToSeller
);

router.post(
  "/reports/returnedToSeller/rAgent",
  isAuth.rAgentAuth,
  rAgentController.postRaReturnedToSeller
);

router.get(
  "/reports/dAgentStats",
  isAuth.rAgentAuth,
  rAgentController.getRaDAgentStats
);

router.post(
  "/reports/dAgentStats/rAgent",
  isAuth.rAgentAuth,
  rAgentController.postRaDAgentStats
);

router.get(
  "/reports/dailyClose",
  isAuth.rAgentAuth,
  rAgentController.getRaDailClose
);

router.post(
  "/reports/dailyClose/rAgent",
  isAuth.rAgentAuth,
  rAgentController.postRaDailyClose
);

router.get(
  "/reports/rAgent/dAgentPackages",
  isAuth.rAgentAuth,
  rAgentController.getDagentPackagesReport
);

router.post(
  "/reports/rAgent/dAgentPackages",
  isAuth.rAgentAuth,
  rAgentController.postDagentPackagesReport
);

router.get(
  "/reports/rAgent/sellerPkg",
  isAuth.rAgentAuth,
  rAgentController.getSellerPackages
);

router.post(
  "/reports/rAgent/sellerPkg",
  isAuth.rAgentAuth,
  rAgentController.postSellerPackagesReport
);

module.exports = router;
