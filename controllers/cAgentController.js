const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const PdfDoc = require("../models/pdfTable");
const Seller = require("../models/seller");
const Order = require("../models/order");
const Dagent = require("../models/dAgent");
const Package = require("../models/package");
const Call = require("../models/calls");
const utils = require("../utils/utilities");
const { find } = require("../models/seller");

exports.getCagentDashBoard = async (req, res, next) => {
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
    res.status(200).render("cAgent/dashBoard", {
      pageTitle: "Dash-Board",
      errorMsg: req.flash("error-code1"),
      callAgent: req.cAgent.name,
      packages: pkgArr,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCaCreateOrder = async (req, res, next) => {
  try {
    const sellers = await Seller.find();
    if (!sellers) {
      req.flash("error-code1", "no sellers registered");
      res.redirect("/cAgent/dashBoard");
    }
    res.status(200).render("cAgent/createOrder", {
      pageTitle: "Create Order",
      sellers: sellers,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//create order by the call agents
exports.postCaCreateOrder = async (req, res, next) => {
  const sellerId = req.body.sellerId;
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
      sellerId: sellerId,
      packages: orderArr,
    });
    await order.save();
    const seller = await Seller.findById(sellerId);
    const io = require("../socket").getIo();
    io.emit("order_created", {
      gov: receivingRegion,
      message: "اوردر وارد من",
      sellerName: seller.name,
    });
    res.status(201).redirect("/cAgent/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getDagentRequests = async (req, res, next) => {
  try {
    const requests = await Dagent.find({ dAgentRequest: "pending" });
    res.status(200).render("cAgent/dAgentReq", {
      pageTitle: "طلبات تسجيل مندوبى الشحن",
      requests: requests || [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//get create delivery agent page
exports.getDagentCreate = async (req, res, next) => {
  const agentId = req.params.agentId;
  try {
    const dAgent = await Dagent.findById(agentId);
    res.status(201).render("cAgent/createDagent", {
      pageTitle: "Create Delivery Agent",
      dAgent: dAgent || "",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//create delivery agent
exports.postDagentCreate = async (req, res, next) => {
  const {
    name,
    phoneNumber,
    idNumber,
    currentAddress,
    deliveryMean,
    driverLicense,
    vehicleLicense,
    trustReceipt,
    region,
    carType,
    paymentMethod,
    paymentValue,
    ratio,
    userName,
    password,
  } = req.body;
  try {
    let trust = false;
    let dAgent = await Dagent.findOne({ idNumber: idNumber });
    if (dAgent) {
      const hashedPassword = await bcrypt.hash(password, 12);
      if (trustReceipt === "on") {
        trust = true;
      }
      dAgent.name = name;
      dAgent.phoneNumber = phoneNumber;
      dAgent.idNumber = idNumber;
      dAgent.currentAddress = currentAddress;
      dAgent.deliveryMean = deliveryMean;
      dAgent.driverLicense = driverLicense;
      dAgent.vehicleLicense = vehicleLicense;
      dAgent.trustReceipt = trust;
      dAgent.region = region;
      dAgent.carType = carType;
      dAgent.paymentMethod = paymentMethod;
      dAgent.paymentValue = paymentValue;
      dAgent.ratio = ratio;
      dAgent.userName = userName;
      dAgent.password = hashedPassword;
      dAgent.dAgentRequest = "approved";
      await dAgent.save();
      return res.status(200).redirect("/cAgent/dashBoard");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    if (trustReceipt === "on") {
      trust = true;
    }
    dAgent = new Dagent({
      name,
      phoneNumber,
      idNumber,
      currentAddress,
      deliveryMean,
      driverLicense,
      vehicleLicense,
      trustReceipt: trust,
      cAgentId: req.cAgent._id,
      region,
      carType,
      paymentMethod,
      paymentValue,
      ratio,
      userName,
      password: hashedPassword,
      dAgentRequest: "approved",
    });
    await dAgent.save();
    res.status(200).redirect("/cAgent/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCallHistory = (req, res, next) => {
  try {
    res.status(200).render("cAgent/callHistory", { pageTitle: "Call History" });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCallHistory = async (req, res, next) => {
  const cAgentId = req.cAgent._id;
  const { callType, callingNumber, callSummery } = req.body;
  try {
    const call = new Call({
      callType,
      callingNumber,
      callSummery,
      cAgentId: cAgentId,
    });
    call.save();
    res.status(201).redirect("/cAgent/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getModifyOrder = (req, res, next) => {
  try {
    res
      .status(200)
      .render("cAgent/modifyOrder", { pageTitle: "تعديل بيانات اوردر" });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postModifyOrder = async (req, res, next) => {
  const orderId = req.body.orderId;
  try {
    const order = await Order.findById(orderId);
    if (!order || order.orderStatus !== "pending review") {
      throw new Error("this order id is not found or already confirmed!");
    }
    const orderDoc = await order.populate("sellerId").execPopulate();
    res.status(201).json({ order: orderDoc });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postConfirmModifyOrder = async (req, res, next) => {
  const region = req.body.region;
  const id = req.body.id;
  try {
    const order = await Order.findById(id);
    if (!order) {
      throw new Error("order is not found");
    }
    order.receivingRegion = region;
    await order.save();
    res.status(201).redirect("/cAgent/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getCaDagentPackagesReport = async (req, res, next) => {
  try {
    const sellers = await Seller.find({});
    if (!sellers) {
      throw new Error("لا يوجد بائعين مسجلين");
    }
    res.status(200).render("reports/dAgentPackages", {
      pageTitle: "تقرير الشحنات لمندوب",
      sellers: sellers || [],
      user: "callAgent",
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

exports.postCaDagentPackagesReport = async (req, res, next) => {
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

exports.getCaSellerPackages = async (req, res, next) => {
  try {
    const sellers = await Seller.find({});
    if (!sellers) {
      throw new Error("no sellers found!");
    }
    res.status(200).render("reports/sellerPackages", {
      pageTitle: "تقرير الشحنات لبائع",
      sellers: sellers || [],
      user: "",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCaSellerPackagesReport = async (req, res, next) => {
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
