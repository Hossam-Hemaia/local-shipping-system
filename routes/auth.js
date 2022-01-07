const express = require("express");
const authController = require("../controllers/authController");

const router = express.Router();

router.get("/seller/register", authController.getSellerRegister);

router.post("/seller/register", authController.postSellerRegister);

router.get("/seller/login", authController.getSellerLogin);

router.post("/seller/login", authController.postSellerLogin);

router.get("/dAgent/register/online", authController.getDagentOnlineCreate);

router.post("/dAgent/register/online", authController.postDagentOnlineCreate);

router.get("/rAgent/login", authController.getRagentLogin);

router.post("/rAgent/login", authController.postRagentLogin);

router.get("/dAgent/login", authController.getDagentLogin);

router.post("/dAgent/login", authController.postDagentLogin);

router.get("/secAgent/login", authController.getSecAgentLogin);

router.post("/secAgent/login", authController.postSecAgentLogin);

router.get("/cAgent/login", authController.getcAgentLogin);

router.post("/cAgent/login", authController.postcAgentLogin);

router.get("/hq/headOffice/create", authController.getHeadOfficeCreate);

router.post("/hq/headOffice/create", authController.postHeadOfficeCreate);

router.get("/headOffice/login", authController.getHeadOfficeLogin);

router.post("/headOffice/login", authController.postHeadOfficeLogin);

router.get("/package/tracking", authController.getPackageTracking);

router.get("/getYourTcode", authController.getYourTcode);

router.get("/package/tracking/:barCode", authController.getPackageTracking);

router.post("/package/tracking", authController.postPackageTracking);

router.post("/packages/tracking/codes", authController.postPackagesCodes);

router.post("/logout", authController.postLogout);

module.exports = router;
