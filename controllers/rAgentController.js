const fs = require("fs");
const path = require("path");
const PdfDoc = require("../models/pdfTable");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const bwip = require("bwip-js");
const Order = require("../models/order");
const Package = require("../models/package");
const utils = require("../utils/utilities");
const Dagent = require("../models/dAgent");
const Dorder = require("../models/dOrder");
const Rorder = require("../models/rOrder");
const Seller = require("../models/seller");
const RevOrder = require("../models/revOrder");
const { findOne } = require("../models/order");

//opening region agent dashboard
exports.getRagentDashBoard = async (req, res, next) => {
  const ordersDetails = [];
  const regionOrders = [];
  const reversedOrders = [];
  try {
    const orders = await Order.find({
      receivingRegion: req.rAgent.region,
      orderStatus: "pending review",
    });
    const rOrders = await Rorder.find({
      receivingRegion: req.rAgent.region,
      orderStatus: "pending review",
    });
    const revOrders = await RevOrder.find({
      receivingRegion: req.rAgent.region,
      orderStatus: "pending review",
    });
    for (let o of orders) {
      let sellerDoc = await o.populate("sellerId").execPopulate();
      ordersDetails.push(sellerDoc);
    }
    for (let rO of rOrders) {
      let rAgentDoc = await rO.populate("rAgentId").execPopulate();
      regionOrders.push(rAgentDoc);
    }
    for (let revO of revOrders) {
      let revOrderDoc = await revO.populate("dAgentId").execPopulate();
      reversedOrders.push(revOrderDoc);
    }
    res.status(200).render("Ragent/dashBoard", {
      pageTitle: "Dash-Board",
      orders: ordersDetails,
      rOrders: regionOrders,
      revOrders: reversedOrders,
      region: req.rAgent.region,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//printing seller order details
exports.getPrintOrderDetails = async (req, res, next) => {
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
    Doc.font(arFont)
      .fontSize(14)
      .text(
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

//printing other regions orders details
exports.getPrintRorderDetails = async (req, res, next) => {
  const rOrderId = req.params.rOrderId;
  const originatingRegion = req.params.region;
  const arFont = path.join("public", "fonts", "Janna.ttf");
  try {
    const rOrder = await Rorder.findById(rOrderId);
    const rOrderName = "order" + rOrderId + ".pdf";
    const orderPath = path.join("data", rOrderName);
    if (!rOrder) {
      throw new Error("No orders found");
    }
    const orderDoc = await rOrder.populate("packages.packageId").execPopulate();
    const packages = orderDoc.packages.map((d) => {
      return { packageId: { ...d.packageId._doc } };
    });
    const reportArr = [];
    for (let item of packages) {
      let rowArr = [];
      rowArr.push(
        item.packageId.deliveryType,
        item.packageId.productPrice,
        utils.textDirection(item.packageId.productName),
        utils.textDirection(item.packageId.address),
        item.packageId.clientNumber,
        utils.textDirection(item.packageId.clientName)
      );
      reportArr.push(rowArr);
    }
    let dateStr = `${rOrder.orderDate}`;
    const Doc = new PdfDoc();
    Doc.pipe(fs.createWriteStream(orderPath));
    Doc.pipe(res);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-disposition",
      'inline; filename="' + rOrderName + '"'
    );
    Doc.fontSize(20).text("Order Details", {
      align: "center",
      underline: true,
    });
    Doc.fontSize(14).text(
      `Date: ${utils.shortDate(dateStr)} - Region: ${originatingRegion}`,
      {
        align: "center",
        underline: true,
      }
    );
    const table = {
      headers: [
        "delivery Type",
        "Price",
        "Product Name",
        "Address",
        "Client Number",
        "Client Name",
      ],
      rows: reportArr,
    };
    Doc.table(table, {
      prepareHeader: () => Doc.font(arFont).fontSize(11),
      prepareRow: (row, i) => Doc.font(arFont).fontSize(9),
    });
    Doc.end();
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//receiving sellers orders
exports.getRagentReceiveOrders = async (req, res, next) => {
  const orderId = req.params.orderId;
  try {
    const order = await Order.findById(orderId);
    if (!order) {
      throw new Error("order not found!");
    }
    order.receiver = req.rAgent.userName;
    await order.save();
    res.status(201).render("Ragent/receiveOrder", {
      pageTitle: "Receive Order",
      packages: order.packages,
      orderId: orderId,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//receiving other regions orders
exports.getRagentReceiveRorders = async (req, res, next) => {
  const rOrderId = req.params.rOrderId;
  try {
    const rOrder = await Rorder.findById(rOrderId);
    if (!rOrder) {
      throw new Error("order not found");
    }
    const orderDoc = await rOrder.populate("packages.packageId").execPopulate();
    const packages = orderDoc.packages.map((d) => {
      return { packageId: { ...d.packageId._doc } };
    });
    res.status(201).render("Ragent/receiveRorder", {
      pageTitle: "Receive Order",
      packages: packages,
      rOrderId: rOrderId,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//checking the package data by validating barcode and status
exports.postCheckPackage = async (req, res, next) => {
  const { pId, barCode } = req.body;
  try {
    const package = await Package.findById(pId);
    if (!package) {
      throw new Error("this package id is not valid");
    }
    if (
      package.barCode === barCode &&
      (package.status === "Redirected" || package.status === "Rejected")
    ) {
      package.status =
        package.status === "Redirected" ? "Processing" : package.status;
      package.currentPosition = "Operation";
      package.rAgentId = req.rAgent._id;
      await package.save();
      const position = `Opertaion(${req.rAgent.region})`;
      const date = Date.now();
      await package.updateTracker(package.status, position, date);
      res.status(200).json({ message: "success" });
    } else {
      res.status(200).json({ message: "faild" });
    }
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//confirming the other regions orders
exports.postConfirmRorder = async (req, res, next) => {
  const rOrderId = req.body.rOrderId;
  try {
    const rOrder = await Rorder.findById(rOrderId);
    if (!rOrder) {
      throw new Error("this order is not valid");
    }
    rOrderDoc = await rOrder.populate("packages.packageId").execPopulate();
    rOrderDoc.packages.forEach((p) => {
      if (
        p.packageId.status !== "Processing" &&
        p.packageId.status !== "Rejected"
      ) {
        throw new Error(`this package id: ${p.packageId._id} is not checked`);
      }
    });
    const rOrderName = "order" + rOrderId + ".pdf";
    const orderPath = path.join("data", rOrderName);
    if (orderPath) {
      utils.deleteFile(orderPath);
    }
    rOrder.orderStatus = "Confrimed";
    await rOrder.save();
    res.status(200).redirect("/rAgent/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//creating package data in the database and printing policy
exports.postCreatePackage = async (req, res, next) => {
  const {
    clientName,
    clientNumber,
    address,
    landmark,
    region,
    productName,
    productPrice,
    deliveryType,
    note,
    deliveryFee,
    orderId,
    pId,
  } = req.body;
  try {
    let package = await Package.findById(pId);
    if (package) {
      throw new Error("Package is already created");
    }
    const order = await Order.findById(orderId);
    const sellerId = order.sellerId;
    const popOrder = await order.populate("sellerId").execPopulate();
    const sellerName = popOrder.sellerId.name;
    const barCode = crypto.randomBytes(8).toString("hex");
    package = new Package({
      _id: pId,
      clientName,
      clientNumber,
      address,
      landmark,
      region,
      productName,
      productPrice,
      deliveryType,
      note,
      deliveryFee,
      barCode,
      sellerId,
      rAgentId: req.rAgent._id,
    });
    const firstPosition = `${sellerName}(seller)`;
    const date = Date.now();
    await package.updateTracker(package.status, firstPosition, date);
    package.status = "Processing";
    const transactionDate = Date.now();
    const position = `Operation(${req.rAgent.region})`;
    await package.updateTracker(package.status, position, transactionDate);
    const barcodeBuffer = await bwip.toBuffer({
      bcid: "code128",
      text: package.barCode,
      scale: 2,
      height: 10,
      includetext: true,
      textxalign: "center",
    });
    const packageName = "package" + package.barCode + ".pdf";
    const packagePath = path.join("data", packageName);
    const logo = path.join("public", "images", "weGoLogo3.jpg");
    const arFont = path.join("public", "fonts", "Janna.ttf");
    const Doc = new PdfDoc();
    Doc.pipe(fs.createWriteStream(packagePath));
    Doc.pipe(res);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-disposition",
      'inline; filename="' + packageName + '"'
    );
    Doc.image(logo, 50, 15, {
      width: 100,
      height: 50,
      align: "left",
      valign: "top",
    });
    Doc.image(barcodeBuffer, 180, 15, {
      width: 200,
      height: 50,
      align: "center",
      valign: "top",
    }).text(`${package.sellerId._id.toString()}`, 405, 30, { width: 200 });
    Doc.font(arFont).text(
      `${utils.textDirection(package.region)} ${utils.textDirection(
        "المحافظه: "
      )}`,
      430,
      58,
      { width: 200 }
    );
    Doc.font(arFont).text(
      `${utils.textDirection(sellerName)} ${utils.textDirection("اسم الراسل: ")}
      ${utils.textDirection(package.clientNumber)}${utils.textDirection(
        "رقم التليفون: "
      )}                          ${utils.textDirection(
        package.clientName
      )} ${utils.textDirection("اسم المستلم:")}
      ${utils.textDirection(package.landmark)}${utils.textDirection(
        "مكان مميز: "
      )}   ${utils.textDirection(package.address)}${utils.textDirection(
        "العنوان: "
      )}
      ${utils.textDirection(package.productName)}${utils.textDirection(
        "وصف المنتج: "
      )}
      ${utils.textDirection(
        "توقيع المستلم: "
      )}                             جنيه  ${
        package.deliveryFee
      }${utils.textDirection("سعر الشحن: ")}             جنيه  ${
        package.productPrice
      }${utils.textDirection("سعر المنتج: ")}
      ${utils.textDirection(package.note)} ${utils.textDirection("ملاحظات: ")} 
      `,
      30,
      80,
      {
        align: "right",
        width: 560,
      }
    );
    Doc.text(
      `${utils.shortDate(new Date().toString())} ${utils.textDirection(
        "التاريخ: "
      )}`,
      {
        align: "left",
        width: 560,
      }
    );
    Doc.rect(398, 20, 170, 30).stroke();
    Doc.rect(15, 82, 580, 20).stroke();
    Doc.rect(15, 104, 580, 20).stroke();
    Doc.rect(15, 126, 580, 20).stroke();
    Doc.rect(15, 148, 580, 20).stroke();
    Doc.rect(280, 170, 315, 20).stroke();
    Doc.rect(15, 170, 263, 20).stroke();
    Doc.rect(15, 192, 580, 20).stroke();
    Doc.rect(15, 214, 580, 20).stroke();
    ////////////////////////////////////
    Doc.image(logo, 50, 415, {
      width: 100,
      height: 50,
      align: "left",
      valign: "top",
    });
    Doc.image(barcodeBuffer, 180, 415, {
      width: 200,
      height: 50,
      align: "center",
      valign: "top",
    }).text(`${package.sellerId._id.toString()}`, 405, 425, { width: 200 });
    Doc.font(arFont).text(
      `${utils.textDirection(package.region)} ${utils.textDirection(
        "المحافظه: "
      )}`,
      430,
      453,
      { width: 200 }
    );
    Doc.font(arFont).text(
      `${utils.textDirection(sellerName)} ${utils.textDirection("اسم الراسل: ")}
      ${utils.textDirection(package.clientNumber)}${utils.textDirection(
        "رقم التليفون: "
      )}                          ${utils.textDirection(
        package.clientName
      )} ${utils.textDirection("اسم المستلم:")}
      ${utils.textDirection(package.landmark)}${utils.textDirection(
        "مكان مميز: "
      )}   ${utils.textDirection(package.address)}${utils.textDirection(
        "العنوان: "
      )}
      ${utils.textDirection(package.productName)}${utils.textDirection(
        "وصف المنتج: "
      )}
      ${utils.textDirection(
        "توقيع المستلم: "
      )}                             جنيه  ${
        package.deliveryFee
      }${utils.textDirection("سعر الشحن: ")}             جنيه  ${
        package.productPrice
      }${utils.textDirection("سعر المنتج: ")}
      ${utils.textDirection(package.note)} ${utils.textDirection("ملاحظات: ")} 
      `,
      30,
      480,
      {
        align: "right",
        width: 560,
      }
    );
    Doc.text(
      `${utils.shortDate(new Date().toString())} ${utils.textDirection(
        "التاريخ: "
      )}`,
      {
        align: "left",
      }
    );
    Doc.rect(398, 420, 170, 30).stroke();
    Doc.rect(15, 482, 580, 20).stroke();
    Doc.rect(15, 504, 580, 20).stroke();
    Doc.rect(15, 526, 580, 20).stroke();
    Doc.rect(15, 548, 580, 20).stroke();
    Doc.rect(280, 570, 315, 20).stroke();
    Doc.rect(15, 570, 263, 20).stroke();
    Doc.rect(15, 592, 580, 20).stroke();
    Doc.rect(15, 614, 580, 20).stroke();
    Doc.end();
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//reprinting package policy function
exports.postPrintPolicy = async (req, res, next) => {
  const packageId = req.body.packageId;
  try {
    const package = await Package.findById(packageId);
    if (!package) {
      throw new Error("this package is not created");
    }
    const sellerDoc = await package.populate("sellerId").execPopulate();
    const sellerName = sellerDoc.sellerId.name;
    const barcodeBuffer = await bwip.toBuffer({
      bcid: "code128",
      text: package.barCode,
      scale: 2,
      height: 10,
      includetext: true,
      textxalign: "center",
    });
    const packageName = "package" + package.barCode + ".pdf";
    const packagePath = path.join("data", packageName);
    const logo = path.join("public", "images", "weGoLogo3.jpg");
    const arFont = path.join("public", "fonts", "Janna.ttf");
    const Doc = new PdfDoc();
    Doc.pipe(fs.createWriteStream(packagePath));
    Doc.pipe(res);
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-disposition",
      'inline; filename="' + packageName + '"'
    );
    Doc.image(logo, 50, 15, {
      width: 100,
      height: 50,
      align: "left",
      valign: "top",
    });
    Doc.image(barcodeBuffer, 180, 15, {
      width: 200,
      height: 50,
      align: "center",
      valign: "top",
    }).text(`${package.sellerId._id.toString()}`, 405, 30, { width: 200 });
    Doc.font(arFont).text(
      `${utils.textDirection(package.region)} ${utils.textDirection(
        "المحافظه: "
      )}`,
      430,
      58,
      { width: 200 }
    );
    Doc.font(arFont).text(
      `${utils.textDirection(sellerName)} ${utils.textDirection("اسم الراسل: ")}
      ${utils.textDirection(package.clientNumber)}${utils.textDirection(
        "رقم التليفون: "
      )}                          ${utils.textDirection(
        package.clientName
      )} ${utils.textDirection("اسم المستلم:")}
      ${utils.textDirection(package.landmark)}${utils.textDirection(
        "مكان مميز: "
      )}   ${utils.textDirection(package.address)}${utils.textDirection(
        "العنوان: "
      )}
      ${utils.textDirection(package.productName)}${utils.textDirection(
        "وصف المنتج: "
      )}
      ${utils.textDirection(
        "توقيع المستلم: "
      )}                             جنيه  ${
        package.deliveryFee
      }${utils.textDirection("سعر الشحن: ")}             جنيه  ${
        package.productPrice
      }${utils.textDirection("سعر المنتج: ")}
      ${utils.textDirection(package.note)} ${utils.textDirection("ملاحظات: ")} 
      `,
      30,
      80,
      {
        align: "right",
        width: 560,
      }
    );
    Doc.text(
      `${utils.shortDate(new Date().toString())} ${utils.textDirection(
        "التاريخ: "
      )}`,
      {
        align: "left",
        width: 560,
      }
    );
    Doc.rect(398, 20, 170, 30).stroke();
    Doc.rect(15, 82, 580, 20).stroke();
    Doc.rect(15, 104, 580, 20).stroke();
    Doc.rect(15, 126, 580, 20).stroke();
    Doc.rect(15, 148, 580, 20).stroke();
    Doc.rect(280, 170, 315, 20).stroke();
    Doc.rect(15, 170, 263, 20).stroke();
    Doc.rect(15, 192, 580, 20).stroke();
    Doc.rect(15, 214, 580, 20).stroke();
    ////////////////////////////////////
    Doc.image(logo, 50, 415, {
      width: 100,
      height: 50,
      align: "left",
      valign: "top",
    });
    Doc.image(barcodeBuffer, 180, 415, {
      width: 200,
      height: 50,
      align: "center",
      valign: "top",
    }).text(`${package.sellerId._id.toString()}`, 405, 425, { width: 200 });
    Doc.font(arFont).text(
      `${utils.textDirection(package.region)} ${utils.textDirection(
        "المحافظه: "
      )}`,
      430,
      453,
      { width: 200 }
    );
    Doc.font(arFont).text(
      `${utils.textDirection(sellerName)} ${utils.textDirection("اسم الراسل: ")}
      ${utils.textDirection(package.clientNumber)}${utils.textDirection(
        "رقم التليفون: "
      )}                          ${utils.textDirection(
        package.clientName
      )} ${utils.textDirection("اسم المستلم:")}
      ${utils.textDirection(package.landmark)}${utils.textDirection(
        "مكان مميز: "
      )}   ${utils.textDirection(package.address)}${utils.textDirection(
        "العنوان: "
      )}
      ${utils.textDirection(package.productName)}${utils.textDirection(
        "وصف المنتج: "
      )}
      ${utils.textDirection(
        "توقيع المستلم: "
      )}                             جنيه  ${
        package.deliveryFee
      }${utils.textDirection("سعر الشحن: ")}             جنيه  ${
        package.productPrice
      }${utils.textDirection("سعر المنتج: ")}
      ${utils.textDirection(package.note)} ${utils.textDirection("ملاحظات: ")} 
      `,
      30,
      480,
      {
        align: "right",
        width: 560,
      }
    );
    Doc.text(
      `${utils.shortDate(new Date().toString())} ${utils.textDirection(
        "التاريخ: "
      )}`,
      {
        align: "left",
      }
    );
    Doc.rect(398, 420, 170, 30).stroke();
    Doc.rect(15, 482, 580, 20).stroke();
    Doc.rect(15, 504, 580, 20).stroke();
    Doc.rect(15, 526, 580, 20).stroke();
    Doc.rect(15, 548, 580, 20).stroke();
    Doc.rect(280, 570, 315, 20).stroke();
    Doc.rect(15, 570, 263, 20).stroke();
    Doc.rect(15, 592, 580, 20).stroke();
    Doc.rect(15, 614, 580, 20).stroke();
    Doc.end();
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//confirm receiving seller order
exports.postConfirmOrder = async (req, res, next) => {
  const orderId = req.body.orderId;
  try {
    const order = await Order.findById(orderId);
    const orderName = "order" + orderId + ".pdf";
    const orderPath = path.join("data", orderName);
    if (orderPath) {
      utils.deleteFile(orderPath);
    }
    if (!order) {
      throw new Error("this order does not exist");
    }
    order.packages.forEach(async (p) => {
      let packageCreated = await Package.findById(p._id);
      if (!packageCreated) {
        res.redirect(`/rAgent/receiveOrder/${orderId}`);
        throw new Error(
          `you cannot confirm order without creating this package: ${p.clientName}`
        );
      }
    });
    if (order.orderStatus !== "confirmed with rejections") {
      order.orderStatus = "Confirmed";
    }
    await order.save();
    res.redirect("/rAgent/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//opening dispatch local packages on the delivery agents
exports.getLocalDispatch = async (req, res, next) => {
  try {
    const localPackages = await Package.find({
      region: req.rAgent.region,
      status: { $in: ["Processing", "Delayed"] },
      currentPosition: "Operation",
    });
    if (!localPackages) {
      throw new Error("No packages to dispatch");
    }
    const dAgents = await Dagent.find({ region: req.rAgent.region });
    if (!dAgents) {
      throw new Error("Create delivery agnets first!");
    }
    res.status(201).render("Ragent/localDispatch", {
      pageTitle: "Local Dispatch",
      packages: localPackages,
      disType: "",
      dAgents,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//dispatching local packages on the delivery agents
exports.postDagentAssignLocal = async (req, res, next) => {
  const dAgents = {};
  let dAgentsArr = [];
  let packagesArr = [];
  if (!Array.isArray(req.body.dAgentId) && !Array.isArray(req.body.pkgId)) {
    dAgentsArr.push(req.body.dAgentId);
    packagesArr.push(req.body.pkgId);
  } else {
    dAgentsArr = [...req.body.dAgentId];
    packagesArr = [...req.body.pkgId];
  }
  try {
    for (let i = 0; i < dAgentsArr.length; ++i) {
      if (!dAgents[dAgentsArr[i]]) {
        let pkgArr = [];
        pkgArr.push({ packageId: packagesArr[i] });
        dAgents[dAgentsArr[i]] = pkgArr;
      } else {
        dAgents[dAgentsArr[i]].push({ packageId: packagesArr[i] });
      }
    }
    let agentsOrders = [];
    for (let id in dAgents) {
      let obj = {};
      obj.dAgentId = id;
      obj.pkgs = dAgents[id];
      agentsOrders.push(obj);
    }
    const date = Date.now();
    for (let o of agentsOrders) {
      let dOrder = new Dorder({
        orderDate: date,
        orderRegion: req.rAgent.region,
        orderStatus: "pending acceptance",
        dAgentId: o.dAgentId,
        packages: o.pkgs,
        rAgentId: req.rAgent._id,
      });
      await dOrder.save();
      for (let p of o.pkgs) {
        let package = await Package.findById(p.packageId);
        if (package.status !== "Rejected") {
          package.status = "Dispatched";
          await package.save();
          let position = `Operation(${req.rAgent.region})`;
          await package.updateTracker(package.status, position, date);
          const packageName = "package" + package.barCode + ".pdf";
          const packagePath = path.join("data", packageName);
          utils.deleteFile(packagePath);
        } else {
          package.status = "Dispatch(rejected)";
          await package.save();
          let position = `Operation(${req.rAgent.region})`;
          await package.updateTracker(package.status, position, date);
        }
      }
    }
    res.redirect("/rAgent/dashBoard");
  } catch (err) {
    console.log(err);
  }
};

//getting local rejected packages to dispatch to return to seller
exports.getLocalRejectedPackages = async (req, res, next) => {
  try {
    const localPackages = await Package.find({
      region: req.rAgent.region,
      status: "Rejected",
      currentPosition: "Operation",
    });
    if (!localPackages) {
      throw new Error("No packages to dispatch");
    }
    const dAgents = await Dagent.find({ region: req.rAgent.region });
    if (!dAgents) {
      throw new Error("Create delivery agnets first!");
    }
    res.status(201).render("Ragent/localDispatch", {
      pageTitle: "Local Dispatch",
      packages: localPackages,
      disType: "rejected",
      dAgents,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//dispatching other regions packages to redirect it to its regions
exports.getRegionsDispatch = async (req, res, next) => {
  const regions = {};
  try {
    const packages = await Package.find({
      region: { $ne: req.rAgent.region },
      status: { $in: ["Processing", "Rejected"] },
      currentPosition: "Operation",
    });
    if (!packages) {
      throw new Error("no packages to dispatch!");
    }
    const pkgSet = new Set();
    for (let pkg of packages) {
      if (!regions[pkg.region]) {
        let pkgArr = [];
        pkgArr.push({ packageId: pkg._id });
        regions[pkg.region] = pkgArr;
        pkgSet.add(pkg._id.toString());
      } else {
        regions[pkg.region].push({ packageId: pkg._id });
        pkgSet.add(pkg._id.toString());
      }
    }
    const date = Date.now();
    let checkExistance = false;
    for (let reg in regions) {
      const existingRorder = await Rorder.findOne({
        rAgentId: req.rAgent._id,
        orderRegion: req.rAgent.region,
        receivingRegion: reg,
      });
      if (existingRorder) {
        let existingPackages = existingRorder.packages;
        for (let pkg of existingPackages) {
          if (pkgSet.has(pkg.packageId.toString())) {
            checkExistance = true;
          }
        }
      }
      if (checkExistance === true) {
        break;
      }
      let rOrder = new Rorder({
        rAgentId: req.rAgent._id,
        orderDate: date,
        orderRegion: req.rAgent.region,
        receivingRegion: reg,
        packages: regions[reg],
      });
      await rOrder.save();
    }
    for (let pkg of packages) {
      if (checkExistance === true) {
        break;
      }
      if (pkg.status !== "Rejected") {
        pkg.status = "Redirected";
        await pkg.save();
      }
      let position = `Operation(${req.rAgent.region})`;
      await pkg.updateTracker(pkg.status, position, date);
    }
    const rOrders = await Rorder.find({
      rAgentId: req.rAgent._id,
      orderStatus: "pending review",
    });
    const dAgents = await Dagent.find({ region: req.rAgent.region });
    res.status(201).render("Ragent/regionsDispatch", {
      pageTitle: "Other Regions Dispatch",
      rOrders: rOrders || [],
      dAgents: dAgents || [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postDagentAssignRegions = async (req, res, next) => {
  let dAgentsIds = [];
  let rOrdersIds = [];
  if (!Array.isArray(req.body.dAgentId)) {
    dAgentsIds.push(req.body.dAgentId);
    rOrdersIds.push(req.body.rOrderId);
  } else {
    dAgentsIds = [...req.body.dAgentId];
    rOrdersIds = [...req.body.rOrderId];
  }
  try {
    for (let i = 0; i < rOrdersIds.length; ++i) {
      let order = await Rorder.findById(rOrdersIds[i]);
      if (!order) {
        throw new Error("no packages to assign");
      }
      order.dAgentId = dAgentsIds[i];
      await order.save();
    }
    res.status(201).redirect("/rAgent/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//get create order page by the operation agents
exports.getCreateOrder = async (req, res, next) => {
  try {
    const sellers = await Seller.find();
    if (!sellers) {
      throw new Error("no sellers registered");
    }
    res.status(200).render("Ragent/createOrder", {
      pageTitle: "Create Order",
      sellers: sellers,
      operationRegion: req.rAgent.region,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//create order by the operation agents
exports.postCreateOrder = async (req, res, next) => {
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
    res.status(201).redirect("/rAgent/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

//get create delivery agent page
exports.getRaDagentCreate = async (req, res, next) => {
  try {
    const dAgent = "";
    res.status(201).render("Ragent/createDagent", {
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
exports.postRaDagentCreate = async (req, res, next) => {
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
    userName,
    password,
  } = req.body;
  try {
    let dAgent = await Dagent.findOne({ idNumber: idNumber });
    if (dAgent) {
      throw new Error("this delivery agent is already created!");
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
      rAgentId: req.rAgent._id,
      region,
      carType,
      paymentMethod,
      userName,
      password: hashedPassword,
      dAgentRequest: "approved",
    });
    await dAgent.save();
    res.status(200).redirect("/rAgent/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getReceiveRevOrder = async (req, res, next) => {
  const revOrderId = req.params.revOrderId;
  try {
    const revOrder = await RevOrder.findById(revOrderId);
    if (!revOrder) {
      throw new Error("No orders found");
    }
    const revOrderDoc = await revOrder
      .populate("packages.packageId")
      .execPopulate();
    const packages = revOrderDoc.packages.map((d) => {
      return { packageId: { ...d.packageId._doc } };
    });
    res.status(200).render("Ragent/receiveRevOrder", {
      pageTitle: "Receive Reversed Order",
      packages: packages,
      revOrderId: revOrderId,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postConfirmRevOrder = async (req, res, next) => {
  revOrderId = req.body.revOrderId;
  try {
    const revOrder = await RevOrder.findById(revOrderId);
    const revOrderDoc = await revOrder
      .populate("packages.packageId")
      .execPopulate();
    const date = Date.now();
    const position = `Operation(${req.rAgent.region})`;
    for (let p of revOrderDoc.packages) {
      p.packageId.currentPosition = "Operation";
      p.packageId.tracker.push({
        packageStatus: p.packageId.status,
        packagePosition: position,
        transactionDate: date,
      });
      await p.packageId.save();
    }
    revOrder.orderStatus = "confirmed";
    await revOrder.save();
    res.status(201).redirect("/rAgent/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postDropPackage = async (req, res, next) => {
  const packageId = req.body.pkgId;
  const orderId = req.body.orderId;
  try {
    const packageExist = await Package.findById(packageId);
    if (packageExist) {
      throw new Error("this packages is created");
    }
    const order = await Order.findById(orderId);
    const newPackages = order.packages.filter((p) => {
      return p._id.toString() !== packageId.toString();
    });
    order.packages = newPackages;
    order.orderStatus = "confirmed with rejections";
    console.log(order);
    await order.save();
    res.status(201).json({ message: "success", pkgArr: newPackages });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getRaReturnedToSeller = (req, res, next) => {
  res.status(200).render("reports/returnedToSeller", {
    pageTitle: "Returned To Seller Report",
    rAgent: req.rAgent._id,
  });
};

exports.postRaReturnedToSeller = async (req, res, next) => {
  const { dateFrom, dateTo } = req.body;
  try {
    const isoDateFrom = utils.toIsoDate(dateFrom, "start");
    const isoDateTo = utils.toIsoDate(dateTo, "");
    const packages = await Package.find({
      region: req.rAgent.region,
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

exports.getRaDAgentStats = (req, res, next) => {
  res.status(200).render("reports/dAgentStats", {
    pageTitle: "Delivery Agents Report",
    rAgent: req.rAgent._id,
  });
};

exports.postRaDAgentStats = async (req, res, next) => {
  const { region, dateFrom, dateTo } = req.body;
  try {
    const isoDateFrom = utils.toIsoDate(dateFrom, "start");
    const isoDateTo = utils.toIsoDate(dateTo, "");
    const packages = await Package.find({
      region: region,
      "tracker.transactionDate": { $gte: isoDateFrom, $lte: isoDateTo },
      "tracker.packageStatus": { $in: ["Delivered", "Rejected"] },
    });
    console.log(packages);
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

exports.getRaDailClose = (req, res, next) => {
  res.status(200).render("reports/dailyClose", {
    pageTitle: "Delivery Agents Report",
    rAgent: req.rAgent._id,
  });
};

exports.postRaDailyClose = async (req, res, next) => {
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

exports.getDagentPackagesReport = async (req, res, next) => {
  try {
    const dAgents = await Dagent.find({ region: req.rAgent.region });
    if (!dAgents) {
      throw new Error("لا يوجد مناديب شحن لهذه المحافظه");
    }
    const sellers = await Seller.find({});
    if (!sellers) {
      throw new Error("لا يوجد بائعين مسجلين");
    }
    res.status(200).render("reports/dAgentPackages", {
      pageTitle: "تقرير الشحنات لمندوب",
      dAgents: dAgents || [],
      sellers: sellers || [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postDagentPackagesReport = async (req, res, next) => {
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

exports.getSellerPackages = async (req, res, next) => {
  try {
    const sellers = await Seller.find({});
    if (!sellers) {
      throw new Error("no sellers found!");
    }
    res.status(200).render("reports/sellerPackages", {
      pageTitle: "تقرير الشحنات لبائع",
      sellers: sellers || [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postSellerPackagesReport = async (req, res, next) => {
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
