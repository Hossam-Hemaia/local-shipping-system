const express = require("express");
const hqController = require("../controllers/hqController");
const isAuth = require("../validations/is-Auth");

const router = express.Router();

router.get("/hq/dashBoard", isAuth.headOfficeAuth, hqController.getDashBoard);

router.get(
  "/hq/seller/requests",
  isAuth.headOfficeAuth,
  hqController.getSellersRequests
);

router.get(
  "/headOffice/orderDetails/:orderId/:sellerName",
  isAuth.headOfficeAuth,
  hqController.getHQPrintOrderDetails
);

router.get(
  "/hq/approveSeller/:sellerId",
  isAuth.headOfficeAuth,
  hqController.getSellerReview
);

router.post(
  "/seller/approve",
  isAuth.headOfficeAuth,
  hqController.postSellerApproved
);

router.get(
  "/rAgent/create",
  isAuth.headOfficeAuth,
  hqController.getRagentCreate
);

router.post(
  "/rAgent/create",
  isAuth.headOfficeAuth,
  hqController.postRagentCreate
);

router.get(
  "/cAgent/create",
  isAuth.headOfficeAuth,
  hqController.getCagentCreate
);

router.post(
  "/cAgent/create",
  isAuth.headOfficeAuth,
  hqController.postCagentCreate
);

router.get(
  "/dAgent/create",
  isAuth.headOfficeAuth,
  hqController.getHqDagentCreate
);

router.get(
  "/hq/dAgentReq",
  isAuth.headOfficeAuth,
  hqController.getHqDagentRequests
);

router.get(
  "/hq/approveAgent/:agentId",
  isAuth.headOfficeAuth,
  hqController.getHqDagentCreate
);

router.post(
  "/hq/dAgent/create",
  isAuth.headOfficeAuth,
  hqController.postHqDagentCreate
);

router.get(
  "/secAgent/create",
  isAuth.headOfficeAuth,
  hqController.getSecAgentCreate
);

router.post(
  "/secAgent/create",
  isAuth.headOfficeAuth,
  hqController.postSecAgentCreate
);

router.get(
  "/headOffice/removeUser",
  isAuth.headOfficeAuth,
  hqController.getRemoveUser
);

router.post(
  "/headOffice/removeUser",
  isAuth.headOfficeAuth,
  hqController.postRemoveUser
);

router.post(
  "/headOffice/remove/User/",
  isAuth.headOfficeAuth,
  hqController.postHeadOfficeRemoveUser
);

router.get(
  "/headOffice/modifyPackage",
  isAuth.headOfficeAuth,
  hqController.getModifyPackage
);

router.post(
  "/headOffice/modifyPackage",
  isAuth.headOfficeAuth,
  hqController.postModifyPackage
);

router.post(
  "/headOffice/modify",
  isAuth.headOfficeAuth,
  hqController.postModify
);

router.get(
  "/headOffice/resetPassword",
  isAuth.headOfficeAuth,
  hqController.getResetPassword
);

router.post(
  "/headOffice/resetPassword",
  isAuth.headOfficeAuth,
  hqController.postResetPassword
);

router.get(
  "/headOffice/reports/returnedToSeller",
  isAuth.headOfficeAuth,
  hqController.getReturnedToSeller
);

router.post(
  "/reports/returnedToSeller",
  isAuth.headOfficeAuth,
  hqController.postReturnedToSeller
);

router.get(
  "/headOffice/reports/dAgentStats",
  isAuth.headOfficeAuth,
  hqController.getDAgentStats
);

router.post(
  "/reports/dAgentStats",
  isAuth.headOfficeAuth,
  hqController.postDAgentStats
);

router.get(
  "/headOffice/reports/dailyClose",
  isAuth.headOfficeAuth,
  hqController.getDailClose
);

router.post(
  "/reports/dailyClose",
  isAuth.headOfficeAuth,
  hqController.postDailyClose
);

router.get(
  "/reports/cAgentStats",
  isAuth.headOfficeAuth,
  hqController.getcAgentStats
);

router.post(
  "/reports/cAgentStats/show",
  isAuth.headOfficeAuth,
  hqController.postcAgentStats
);

router.get(
  "/reports/hq/dAgentPackages",
  isAuth.headOfficeAuth,
  hqController.getHqDagentPackagesReport
);

router.post(
  "/headOffice/getAgents",
  isAuth.headOfficeAuth,
  hqController.postGetAgentsNames
);

router.post(
  "/reports/hq/dAgentPackages",
  isAuth.headOfficeAuth,
  hqController.postHqDagentPackagesReport
);

router.get(
  "/reports/hq/sellerPkgs",
  isAuth.headOfficeAuth,
  hqController.getHqSellerPackages
);

router.post(
  "/reports/hq/sellerPkgs",
  isAuth.headOfficeAuth,
  hqController.postHqSellerPackagesReport
);

module.exports = router;
