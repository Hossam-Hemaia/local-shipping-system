const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const Seller = require("../models/seller");
const Ragent = require("../models/rAgent");
const Dagent = require("../models/dAgent");
const SecAgent = require("../models/security");
const Cagent = require("../models/cAgent");
const Package = require("../models/package");
const Hoffice = require("../models/hOffice");
const utils = require("../utils/utilities");
const Rorder = require("../models/rOrder");
const Order = require("../models/order");
const RevOrder = require("../models/revOrder");
const Call = require("../models/calls");
const PdfDoc = require("../models/pdfTable");
const { find } = require("../models/seller");

exports.getDashBoard = async (req, res, next) => {
  const ordersDetails = [];
  try {
    const today = new Date();
    let date = today;
    date.setHours(00);
    date.setMinutes(00);
    const isoDateFrom = utils.toIsoDate(date, "start");
    const packages = await Package.find({
      status: "Rejected",
      "tracker.transactionDate": { $gte: isoDateFrom },
      "tracker.packageStatus": "Rejected",
    });
    let pkgArr = [];
    for (let pkg of packages) {
      let pkgData = {};
      let pkgDoc = await pkg.populate("sellerId").execPopulate();
      pkgData.clientName = pkgDoc.clientName;
      pkgData.reason = pkgDoc.rejectionReason;
      pkgData.sellerName = pkgDoc.sellerId.name;
      pkgData.sellerPhone = pkgDoc.sellerId.phoneNumber;
      pkgData.productName = pkgDoc.productName;
      pkgData.barCode = pkgDoc.barCode;
      pkgArr.push(pkgData);
    }
    const orders = await Order.find({
      orderStatus: "pending review",
    });
    for (let o of orders) {
      let sellerDoc = await o.populate("sellerId").execPopulate();
      ordersDetails.push(sellerDoc);
    }
    res.status(200).render("hq/dashBoard", {
      pageTitle: "Head Office Dash-Board",
      orders: ordersDetails,
      user: req.headOffice.name,
      packages: pkgArr,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getHQPrintOrderDetails = async (req, res, next) => {
  try {
    const orderId = req.params.orderId;
    const sellerName = req.params.sellerName;
    const order = await Order.findById(orderId);
    const orderName = "order" + orderId + ".pdf";
    const orderPath = path.join("data", orderName);
    const arFont = path.join("public", "fonts", "Janna.ttf");
    if (!order) {
      throw new Error("No orders found");
    }
    const reportArr = [];
    for (let item of order.packages) {
      let rowArr = [];
      rowArr.push(
        item.package.productPrice,
        utils.textDirection(item.package.productName),
        utils.textDirection(item.package.address),
        item.package.clientNumber,
        utils.textDirection(item.package.clientName)
      );
      reportArr.push(rowArr);
    }
    let dateStr = `${order.date}`;
    const Doc = new PdfDoc();
    Doc.pipe(fs.createWriteStream(orderPath));
    Doc.pipe(res);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-disposition",
      'inline; filename="' + orderName + '"'
    );
    Doc.fontSize(20).text("Order Details", {
      align: "center",
      underline: true,
    });
    Doc.fontSize(14).text(
      `Date: ${utils.shortDate(dateStr)} - Seller: ${utils.textDirection(
        sellerName
      )}`,
      {
        align: "center",
        underline: true,
      }
    );
    const table = {
      headers: [
        "Price",
        "Product Name",
        "Address",
        "Client Number",
        "Client Name",
      ],
      rows: reportArr,
    };
    Doc.table(table, {
      prepareHeader: () => Doc.font(arFont).fontSize(12),
      prepareRow: (row, i) => Doc.font(arFont).fontSize(10),
    });
    Doc.end();
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getSellersRequests = async (req, res, next) => {
  try {
    const requests = await Seller.find({ sellerRequest: "pending" });
    res.render("hq/sellersReq", {
      pageTitle: "Sellers Requests",
      requests: requests,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getSellerReview = async (req, res, next) => {
  const sellerId = req.params.sellerId;
  try {
    const seller = await Seller.findById(sellerId);
    if (!seller) {
      return res.redirect("/hq/sellers/requests");
    }
    res.render("hq/approveSeller", {
      pageTitle: "Approve Seller",
      seller: seller,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postSellerApproved = async (req, res, next) => {
  const {
    name,
    address,
    phoneNumber,
    niche,
    region,
    sellerId,
    hasOffer,
    offerEndDate,
    paymentMethod,
    ratio,
  } = req.body;
  try {
    const seller = await Seller.findById(sellerId);
    seller.name = name;
    seller.address = address;
    seller.phoneNumber = phoneNumber;
    seller.niche = niche;
    seller.region = region;
    if (hasOffer === "on") {
      seller.hasOffer = true;
      seller.offerEndDate = offerEndDate;
    }
    seller.paymentMethod = paymentMethod;
    seller.ratio = ratio;
    seller.sellerRequest = "approved";
    await seller.save();
    res.redirect("/hq/seller/requests");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getRagentCreate = (req, res, next) => {
  res
    .status(200)
    .render("hq/createRAgent", { pageTitle: "Create Region Agent" });
};

exports.postRagentCreate = async (req, res, next) => {
  const { name, region, phoneNumber, userName, password } = req.body;
  try {
    let rAgent = await Ragent.findOne({ userName: userName });
    if (rAgent) {
      return res.redirect("/hq/dashBoard");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    rAgent = new Ragent({
      name,
      region,
      phoneNumber,
      userName,
      password: hashedPassword,
    });
    await rAgent.save();
    res.redirect("/hq/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getHqDagentRequests = async (req, res, next) => {
  try {
    const requests = await Dagent.find({ dAgentRequest: "pending" });
    res.status(200).render("hq/dAgentReq", {
      pageTitle: "طلبات تسجيل مندوبى الشحن",
      requests: requests || [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getHqDagentCreate = async (req, res, next) => {
  const agentId = req.params.agentId;
  try {
    const dAgent = await Dagent.findById(agentId);
    res.status(201).render("hq/createDagent", {
      pageTitle: "Create Delivery Agent",
      dAgent: dAgent || "",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postHqDagentCreate = async (req, res, next) => {
  const {
    name,
    phoneNumber,
    idNumber,
    currentAddress,
    deliveryMean,
    driverLicense,
    vehicleLicense,
    region,
    carType,
    paymentMethod,
    userName,
    password,
  } = req.body;
  try {
    let dAgent = await Dagent.findOne({ idNumber: idNumber });
    if (dAgent) {
      const hashedPassword = await bcrypt.hash(password, 12);
      dAgent.name = name;
      dAgent.phoneNumber = phoneNumber;
      dAgent.idNumber = idNumber;
      dAgent.currentAddress = currentAddress;
      dAgent.deliveryMean = deliveryMean;
      dAgent.driverLicense = driverLicense;
      dAgent.vehicleLicense = vehicleLicense;
      dAgent.region = region;
      dAgent.carType = carType;
      dAgent.paymentMethod = paymentMethod;
      dAgent.userName = userName;
      dAgent.password = hashedPassword;
      dAgent.dAgentRequest = "approved";
      await dAgent.save();
      return res.status(200).redirect("/hq/dashBoard");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    dAgent = new Dagent({
      name,
      phoneNumber,
      idNumber,
      currentAddress,
      deliveryMean,
      driverLicense,
      vehicleLicense,
      region,
      carType,
      paymentMethod,
      userName,
      password: hashedPassword,
      dAgentRequest: "approved",
    });
    await dAgent.save();
    res.status(200).redirect("/hq/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getSecAgentCreate = (req, res, next) => {
  res
    .status(200)
    .render("hq/createSecAgent", { pageTitle: "Create Security Agent" });
};

exports.postSecAgentCreate = async (req, res, next) => {
  const { name, region, phoneNumber, userName, password } = req.body;
  try {
    let secAgent = await SecAgent.findOne({ userName: userName });
    if (secAgent) {
      return res.redirect("/hq/dashBoard");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    secAgent = new SecAgent({
      name,
      region,
      phoneNumber,
      userName,
      password: hashedPassword,
    });
    console.log(secAgent);
    await secAgent.save();
    res.redirect("/hq/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCagentCreate = (req, res, next) => {
  res.status(200).render("hq/createCAgent", { pageTitle: "Create Call Agent" });
};

exports.postCagentCreate = async (req, res, next) => {
  const { name, phoneNumber, userName, password } = req.body;
  try {
    let cAgent = await Cagent.findOne({ userName: userName });
    if (cAgent) {
      return res.redirect("/hq/dashBoard");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    cAgent = new Cagent({
      name,
      phoneNumber,
      userName,
      password: hashedPassword,
    });
    await cAgent.save();
    res.redirect("/hq/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getRemoveUser = (req, res, next) => {
  res.status(200).render("hq/removeUser", { pageTitle: "Remove User" });
};

exports.postRemoveUser = async (req, res, next) => {
  const userType = req.body.userType;
  try {
    let users;
    if (userType === "rAgent") {
      users = await Ragent.find({});
      res.status(200).json({ type: users });
    } else if (userType === "dAgent") {
      users = await Dagent.find({});
      res.status(200).json({ type: users });
    } else if (userType === "cAgent") {
      users = await Cagent.find({});
      res.status(200).json({ type: users });
    } else if (userType === "secAgent") {
      users = await SecAgent.find({});
      res.status(200).json({ type: users });
    } else {
      res.status(201).json({ message: "Faild" });
    }
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postHeadOfficeRemoveUser = async (req, res, next) => {
  const { agentId, userType } = req.body;
  try {
    if (userType === "dAgent") {
      await Dagent.findByIdAndDelete(agentId);
      res.status(201).json({ message: "Success" });
    } else if (userType === "rAgent") {
      await Ragent.findByIdAndDelete(agentId);
      res.status(201).json({ message: "Success" });
    } else if (userType === "cAgent") {
      await Cagent.findByIdAndDelete(agentId);
      res.status(201).json({ message: "Success" });
    } else if (userType === "secAgent") {
      await SecAgent.findByIdAndDelete(agentId);
      res.status(201).json({ message: "Success" });
    } else {
      res.status(201).json({ message: "Faild" });
    }
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getModifyPackage = (req, res, next) => {
  res
    .status(200)
    .render("hq/modifyPackage", { pageTitle: "Modify Package Data" });
};

exports.postModifyPackage = async (req, res, next) => {
  const barCode = req.body.barCode;
  try {
    const package = await Package.findOne({
      barCode: barCode,
    });
    if (!package) {
      throw new Error("no package found for this barcode");
    }
    res.status(201).json({ packageData: package });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postModify = async (req, res, next) => {
  const {
    clientName,
    clientNumber,
    address,
    status,
    currentPosition,
    deliveryFee,
    productName,
    productPrice,
    rejectionReason,
    landmark,
    region,
    deliveryType,
    note,
  } = req.body;
  try {
    const package = await Package.findOne({
      barCode: barCode,
    });
    if (!package) {
      throw new Error("no package found for this barcode");
    }
    package.clientName = clientName;
    package.clientNumber = clientNumber;
    package.status = status;
    package.address = address;
    package.currentPosition = currentPosition;
    package.deliveryFee = deliveryFee;
    package.productName = productName;
    package.productPrice = productPrice;
    package.landmark = landmark;
    package.rejectionReason = rejectionReason;
    package.deliveryType = deliveryType;
    package.region = region;
    package.note = note;
    package.save();
    res.status(201).redirect("/hq/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getResetPassword = (req, res, next) => {
  try {
    res
      .status(200)
      .render("hq/changePassword", { pageTitle: "Reset Password" });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postResetPassword = async (req, res, next) => {
  const { userType, userName, password } = req.body;
  try {
    let user;
    if (userType === "admin") {
      user = await Hoffice.findOne({ userName: userName });
      if (!user) {
        throw new Error("this user does not exist");
      }
    } else if (userType === "rAgent") {
      user = await Ragent.findOne({ userName: userName });
      if (!user) {
        throw new Error("this user does not exist");
      }
    } else if (userType === "dAgent") {
      user = await Dagent.findOne({ userName: userName });
      if (!user) {
        throw new Error("this user does not exist");
      }
    } else if (userType === "cAgent") {
      user = await Cagent.findOne({ userName: userName });
      if (!user) {
        throw new Error("this user does not exist");
      }
    } else if (userType === "secAgent") {
      user = await SecAgent.findOne({ userName: userName });
      if (!user) {
        throw new Error("this user does not exist");
      }
    } else {
      res
        .status(201)
        .render("hq/changePassword", { pageTitle: "Reset Password" });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    user.password = hashedPassword;
    await user.save();
    res.status(201).redirect("/hq/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getReturnedToSeller = (req, res, next) => {
  res.status(200).render("reports/returnedToSeller", {
    pageTitle: "Returned To Seller Report",
  });
};

exports.postReturnedToSeller = async (req, res, next) => {
  const { dateFrom, dateTo } = req.body;
  try {
    const isoDateFrom = utils.toIsoDate(dateFrom, "start");
    const isoDateTo = utils.toIsoDate(dateTo, "");
    const packages = await Package.find({
      status: { $in: ["Returned-to-seller", "Delivered"] },
      "tracker.transactionDate": { $gte: isoDateFrom, $lte: isoDateTo },
      "tracker.packageStatus": { $in: ["Returned-to-seller", "Delivered"] },
    });
    let obj = {};
    for (let p of packages) {
      const pDoc = await p.populate("sellerId").execPopulate();
      if (!obj[pDoc.sellerId.name]) {
        let stats = {};
        obj[pDoc.sellerId.name] = stats;
        if (pDoc.status === "Returned-to-seller") {
          obj[pDoc.sellerId.name].returned = 1;
          obj[pDoc.sellerId.name].delivered = 0;
        }
        if (pDoc.status === "Delivered") {
          obj[pDoc.sellerId.name].delivered = 1;
          obj[pDoc.sellerId.name].returned = 0;
        }
      } else {
        if (pDoc.status === "Delivered") {
          obj[pDoc.sellerId.name].delivered += 1;
        } else if (pDoc.status === "Returned-to-seller") {
          obj[pDoc.sellerId.name].returned += 1;
        }
      }
    }
    res.status(201).json({ returnStats: obj });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getDAgentStats = (req, res, next) => {
  res.status(200).render("reports/dAgentStats", {
    pageTitle: "Delivery Agents Report",
  });
};

exports.postDAgentStats = async (req, res, next) => {
  const { region, dateFrom, dateTo } = req.body;
  try {
    const isoDateFrom = utils.toIsoDate(dateFrom, "start");
    const isoDateTo = utils.toIsoDate(dateTo, "");
    const packages = await Package.find({
      region: region,
      "tracker.transactionDate": { $gte: isoDateFrom, $lte: isoDateTo },
      "tracker.packageStatus": { $in: ["Delivered", "Rejected"] },
    });
    let obj = {};
    for (let p of packages) {
      const pDoc = await p.populate("dAgentId").execPopulate();
      if (!obj[pDoc.dAgentId.name]) {
        let stats = {};
        obj[pDoc.dAgentId.name] = stats;
        if (pDoc.status === "Rejected") {
          obj[pDoc.dAgentId.name].returned = 1;
          obj[pDoc.dAgentId.name].delivered = 0;
        }
        if (pDoc.status === "Delivered") {
          obj[pDoc.dAgentId.name].delivered = 1;
          obj[pDoc.dAgentId.name].returned = 0;
        }
      } else {
        if (pDoc.status === "Delivered") {
          obj[pDoc.dAgentId.name].delivered += 1;
        } else if (pDoc.status === "Rejected") {
          obj[pDoc.dAgentId.name].returned += 1;
        }
      }
    }
    res.status(201).json({ returnStats: obj });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getDailClose = (req, res, next) => {
  res.status(200).render("reports/dailyClose", {
    pageTitle: "Delivery Agents Report",
  });
};

exports.postDailyClose = async (req, res, next) => {
  const { region, date } = req.body;
  try {
    const isoDate = utils.toIsoDate(date, "start");
    const orders = await Order.find({
      date: { $gte: isoDate },
      orderStatus: "Confirmed",
      receivingRegion: region,
    });
    const rOrders = await Rorder.find({
      orderDate: { $gte: isoDate },
      orderStatus: "Confirmed",
      receivingRegion: region,
    });
    const revOrders = await RevOrder.find({
      orderDate: { $gte: isoDate },
      orderStatus: "confirmed",
      receivingRegion: region,
    });
    let pkgCount = 0;
    let delivery = 0;
    let remaining = 0;
    if (orders) {
      for (let o of orders) {
        pkgCount += o.packages.length;
        for (let p of o.packages) {
          const pDoc = await Package.findById(p._id);
          if (
            pDoc.status === "Delivered" ||
            pDoc.status === "Returned-to-seller"
          ) {
            ++delivery;
          } else if (pDoc.status === "Processing") {
            ++remaining;
          }
        }
      }
    }
    if (rOrders) {
      for (let o of rOrders) {
        pkgCount += o.packages.length;
        let oDoc = await o.populate("packages.packageId").execPopulate();
        for (let doc of oDoc.packages) {
          if (
            doc.packageId.status === "Delivered" ||
            doc.packageId.status === "Returned-to-seller"
          ) {
            ++delivery;
          } else if (doc.packageId.status === "Processing") {
            ++remaining;
          }
        }
      }
    }
    if (revOrders) {
      for (let o of revOrders) {
        let oDoc = await o.populate("packages.packageId").execPopulate();
        for (let doc of oDoc.packages) {
          if (
            doc.packageId.status === "Processing" ||
            doc.packageId.status === "Delayed" ||
            (doc.packageId.status === "Rejected" &&
              doc.packageId.currentPosition === "Operation")
          ) {
            ++remaining;
          }
        }
      }
    }
    let obj = {
      pkgs: pkgCount,
      delivered: delivery,
      remaining: remaining,
    };
    res.status(201).json({ returnStats: obj });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getcAgentStats = (req, res, next) => {
  res.status(200).render("reports/cAgentStats", {
    pageTitle: "Call Agents Report",
  });
};

exports.postcAgentStats = async (req, res, next) => {
  const { dateFrom, dateTo } = req.body;
  try {
    const isoDateFrom = utils.toIsoDate(dateFrom, "start");
    const isoDateTo = utils.toIsoDate(dateTo, "");
    const calls = await Call.find({
      date: { $gte: isoDateFrom, $lte: isoDateTo },
    });
    if (!calls) {
      throw new Error("No calls registered in this period");
    }
    let callsArr = [];
    for (let call of calls) {
      let callDoc = await call.populate("cAgentId").execPopulate();
      callsArr.push(callDoc);
    }
    res.status(201).json({ calls: callsArr });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getHqDagentPackagesReport = async (req, res, next) => {
  try {
    const sellers = await Seller.find({});
    if (!sellers) {
      throw new Error("لا يوجد بائعين مسجلين");
    }
    res.status(200).render("reports/dAgentPackages", {
      pageTitle: "تقرير الشحنات لمندوب",
      sellers: sellers || [],
      user: "admin",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postGetAgentsNames = async (req, res, next) => {
  const region = req.body.region;
  try {
    const dAgents = await Dagent.find({ region: region });
    if (!dAgents) {
      throw new Error("لا يوجد مناديب شحن لهذه المحافظه");
    }
    res.status(201).json({ agents: dAgents });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postHqDagentPackagesReport = async (req, res, next) => {
  const { dAgentId, sellerId, dateFrom, dateTo } = req.body;
  const arFont = path.join("public", "fonts", "Janna.ttf");
  try {
    const agentName = "agent" + dAgentId + ".pdf";
    const agentPath = path.join("data", agentName);
    const isoDateFrom = utils.toIsoDate(dateFrom, "start");
    const isoDateTo = utils.toIsoDate(dateTo, "");
    const dAgent = await Dagent.findById(dAgentId);
    let packages;
    if (sellerId === "all") {
      packages = await Package.find({
        dAgentId: dAgentId,
        status: { $ne: "Processing" },
        "tracker.transactionDate": { $gte: isoDateFrom, $lte: isoDateTo },
      });
    } else {
      packages = await Package.find({
        dAgentId: dAgentId,
        sellerId: sellerId,
        status: { $ne: "Processing" },
        "tracker.transactionDate": { $gte: isoDateFrom, $lte: isoDateTo },
      });
    }
    const reportArr = [];
    let counter = 1;
    let sumProductPrice = 0;
    let sumDeliveryFee = 0;
    for (let pkg of packages) {
      let pkgDoc = await pkg.populate("sellerId").execPopulate();
      let rowArr = [];
      sumProductPrice += pkgDoc.productPrice;
      sumDeliveryFee += pkgDoc.deliveryFee;
      rowArr.push(
        "",
        pkgDoc.deliveryFee,
        pkgDoc.productPrice,
        utils.textDirection(pkgDoc.status),
        utils.textDirection(pkgDoc.productName),
        utils.textDirection(pkgDoc.sellerId.name),
        pkgDoc.clientNumber,
        utils.textDirection(pkgDoc.address),
        utils.textDirection(pkgDoc.clientName),
        counter
      ),
        reportArr.push(rowArr);
      ++counter;
    }
    const totalSum = sumProductPrice + sumDeliveryFee;
    const Doc = new PdfDoc({ layout: "landscape" });
    Doc.pipe(fs.createWriteStream(agentPath));
    Doc.pipe(res);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-disposition",
      'attach; filename="' + agentName + '"'
    );
    Doc.font(arFont)
      .fontSize(16)
      .text(utils.textDirection("تقرير الشحنات لمندوب"), 100, 20, {
        align: "center",
        underline: true,
      });
    Doc.font(arFont)
      .fontSize(14)
      .text(utils.textDirection(`عن الفتره من ${dateFrom}  حتى ${dateTo}`), {
        align: "center",
        underline: true,
      });
    Doc.font(arFont)
      .fontSize(14)
      .text(utils.textDirection(`اسم المندوب: ${dAgent.name}`), 400, 70, {
        align: "right",
      });
    Doc.font(arFont)
      .fontSize(14)
      .text(utils.textDirection(`المنطقه: ${dAgent.region}`), 70, 70, {
        align: "left",
      });
    const table = {
      headers: [
        utils.textDirection("ملاحظات"),
        utils.textDirection("قيمة الشحن"),
        utils.textDirection("سعر المنتج"),
        utils.textDirection("حالة التسليم"),
        utils.textDirection("اسم المنتج"),
        utils.textDirection("اسم البائع"),
        utils.textDirection("التليفون"),
        utils.textDirection("العنوان"),
        utils.textDirection("اسم العميل"),
        utils.textDirection("م"),
      ],
      rows: reportArr,
    };
    Doc.table(table, {
      prepareHeader: () => Doc.font(arFont).fontSize(11),
      prepareRow: (row, i) => Doc.font(arFont).fontSize(9),
    });
    Doc.font(arFont)
      .fontSize(14)
      .text(utils.textDirection(`إجمالى قيمة الشحنات: ${sumProductPrice}`), {
        align: "right",
      });
    Doc.font(arFont)
      .fontSize(14)
      .text(
        utils.textDirection(`إجمالى قيمة مصاريف الشحن: ${sumDeliveryFee}`),
        { align: "right" }
      );
    Doc.text("__________________________________", { align: "right" });
    Doc.font(arFont)
      .fontSize(14)
      .text(utils.textDirection(`إجمالى القيمة: ${totalSum}`), {
        align: "right",
      });
    Doc.font(arFont)
      .fontSize(14)
      .text(utils.textDirection("إقرار"), { underline: true, align: "right" });
    Doc.font(arFont)
      .fontSize(12)
      .text(
        utils.textDirection(
          "أقر انا /................................بأننى تسلمت عدد........شحنات الموضحه بالبيان أعلاه على ان اقوم بتسليمها للمرسل إليه خلال.........ساعه"
        ),
        { align: "right" }
      );
    Doc.font(arFont)
      .fontSize(12)
      .text(
        utils.textDirection(
          "من استلامها وأتعهد برد الشحنات المرتجعه الى الشركه فى خلال........ساعه."
        ),
        { align: "right" }
      );
    Doc.font(arFont)
      .fontSize(12)
      .text(utils.textDirection("وهذا إقرار منى بذلك،"), { align: "center" });
    Doc.end();
    utils.deleteFile(agentPath);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getHqSellerPackages = async (req, res, next) => {
  try {
    const sellers = await Seller.find({});
    if (!sellers) {
      throw new Error("no sellers found!");
    }
    res.status(200).render("reports/sellerPackages", {
      pageTitle: "تقرير الشحنات لبائع",
      sellers: sellers || [],
      user: "admin",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postHqSellerPackagesReport = async (req, res, next) => {
  const { sellerId, dateFrom, dateTo } = req.body;
  const arFont = path.join("public", "fonts", "Janna.ttf");
  try {
    const sellerName = "seller" + sellerId + ".pdf";
    const sellerPath = path.join("data", sellerName);
    const isoDateFrom = utils.toIsoDate(dateFrom, "start");
    const isoDateTo = utils.toIsoDate(dateTo, "");
    const seller = await Seller.findById(sellerId);
    const packages = await Package.find({
      sellerId: sellerId,
      "tracker.transactionDate": { $gte: isoDateFrom, $lte: isoDateTo },
      "tracker.packageStatus": "Processing",
    });
    if (!packages) {
      throw new Error("No packages found!");
    }
    const reportArr = [];
    let counter = 1;
    2;
    for (let pkg of packages) {
      let rowArr = [];
      rowArr.push(
        "[   ]",
        "[   ]",
        "[   ]",
        pkg.deliveryFee,
        pkg.productPrice,
        "",
        utils.textDirection(pkg.note),
        utils.textDirection(pkg.productName),
        utils.textDirection(pkg.address + " " + pkg.landmark),
        pkg.clientNumber,
        utils.textDirection(pkg.clientName),
        counter
      ),
        reportArr.push(rowArr);
      ++counter;
    }
    const Doc = new PdfDoc({
      layout: "landscape",
      margins: { top: 10, left: 10, right: 10, bottom: 10 },
      size: "A4",
    });
    Doc.pipe(fs.createWriteStream(sellerPath));
    Doc.pipe(res);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-disposition",
      'attach; filename="' + sellerName + '"'
    );
    Doc.font(arFont)
      .fontSize(10)
      .text(utils.textDirection("تقرير الشحنات لبائع"), 90, 20, {
        align: "center",
        underline: true,
      });
    Doc.font(arFont)
      .fontSize(10)
      .text(utils.textDirection(`عن الفتره من ${dateFrom}  حتى ${dateTo}`), {
        align: "center",
        underline: true,
      });
    Doc.font(arFont)
      .fontSize(10)
      .text(utils.textDirection(`اسم البائع: ${seller.name}`), 400, 70, {
        align: "right",
      });
    const table = {
      headers: [
        utils.textDirection("مؤجل"),
        utils.textDirection("رفض"),
        utils.textDirection("سلم"),
        utils.textDirection("قيمة الشحن"),
        utils.textDirection("سعر المنتج"),
        utils.textDirection("العدد"),
        utils.textDirection("ملاحظات"),
        utils.textDirection("نوع المنتج"),
        utils.textDirection("العنوان"),
        utils.textDirection("التليفون"),
        utils.textDirection("اسم العميل"),
        utils.textDirection("م"),
      ],
      rows: reportArr,
    };
    Doc.table(table, {
      prepareHeader: () => Doc.font(arFont).fontSize(8),
      prepareRow: (row, i) => Doc.font(arFont).fontSize(7),
    });
    Doc.text("                      ", { align: "right" });
    Doc.font(arFont).fontSize(12).text(utils.textDirection("مدخل البيانات"), {
      underline: true,
      align: "right",
    });
    Doc.end();
    utils.deleteFile(sellerPath);
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
