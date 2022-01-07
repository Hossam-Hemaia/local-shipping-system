const express = require("express");
const sellerController = require("../controllers/sellerController");
const isAuth = require("../validations/is-Auth");

const router = express.Router();

router.get(
  "/seller/dashBoard",
  isAuth.sellerAuth,
  sellerController.getSellerDashBoard
);

router.get(
  "/seller/createOrder",
  isAuth.sellerAuth,
  sellerController.getCreateOrder
);

router.post(
  "/seller/createOrder",
  isAuth.sellerAuth,
  sellerController.postCreateOrder
);

router.get(
  "/seller/tracking/order/:orderId",
  isAuth.sellerAuth,
  sellerController.getSellerOrderTracking
);

module.exports = router;
