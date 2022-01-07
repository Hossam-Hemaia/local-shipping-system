const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Seller = require("../models/seller");
const Package = require("../models/package");
const Order = require("../models/order");

exports.getSellerDashBoard = async (req, res, next) => {
  try {
    const orders = await Order.find({ sellerId: req.seller._id });
    if (!orders) {
      res.status(200).render("seller/dashBoard", {
        pageTitle: "Dash-Board",
        isApproved: req.seller.sellerRequest,
        sellerName: req.seller.name,
        orders: [],
      });
    }
    res.status(200).render("seller/dashBoard", {
      pageTitle: "Dash-Board",
      isApproved: req.seller.sellerRequest,
      sellerName: req.seller.name,
      orders: orders.reverse(),
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCreateOrder = (req, res, next) => {
  res.status(200).render("seller/createOrder", { pageTitle: "Create Order" });
};

exports.postCreateOrder = async (req, res, next) => {
  const receivingRegion = req.body.receivingRegion;
  const orderArr = [];
  if (!Array.isArray(req.body.clientName)) {
    let orderObj = {
      clientName: req.body.clientName,
      clientNumber: req.body.clientNumber,
      address: req.body.address,
      landmark: req.body.landmark,
      region: req.body.region,
      productName: req.body.productName,
      productPrice: req.body.productPrice,
      deliveryType: req.body.deliveryType,
      note: req.body.note,
      accepted: "pending",
    };
    orderArr.push({ package: orderObj });
  } else {
    const pkgArrLength = req.body.clientName.length;
    for (let i = 0; i < pkgArrLength; ++i) {
      let orderObj = {
        clientName: req.body.clientName[i],
        clientNumber: req.body.clientNumber[i],
        address: req.body.address[i],
        landmark: req.body.landmark[i],
        region: req.body.region[i],
        productName: req.body.productName[i],
        productPrice: req.body.productPrice[i],
        deliveryType: req.body.deliveryType[i],
        note: req.body.note[i],
        accepted: "pending",
      };
      orderArr.push({ package: orderObj });
    }
  }
  try {
    const order = await Order({
      receivingRegion,
      sellerId: req.seller._id,
      packages: orderArr,
    });
    await order.save();
    const io = require("../socket").getIo();
    io.emit("order_created", {
      gov: receivingRegion,
      message: "اوردر وارد من",
      sellerName: req.seller.name,
    });
    res.status(201).redirect("/seller/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getSellerOrderTracking = async (req, res, next) => {
  const orderId = req.params.orderId;
  try {
    const order = await Order.findById(orderId);
    if (order.orderStatus === "pending review") {
      throw new Error("this order is not received yet");
    }
    const packagesInfo = [];
    for (let p of order.packages) {
      let pkgObj = {};
      let package = await Package.findById(p._id);
      pkgObj.name = package.clientName;
      pkgObj.address = package.address;
      pkgObj.productName = package.productName;
      pkgObj.barCode = package.barCode;
      packagesInfo.push(pkgObj);
    }
    res.status(200).render("seller/getYourTcode", {
      pageTitle: "تتبع شحناتك",
      packages: packagesInfo || [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
