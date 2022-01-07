const { find, findOne } = require("../models/dOrder");
const Dorder = require("../models/dOrder");
const Package = require("../models/package");
const RevOrder = require("../models/revOrder");
const utils = require("../utils/utilities");

exports.getDagentDashBoard = async (req, res, next) => {
  try {
    const dOrders = await Dorder.find({
      dAgentId: req.dAgent._id,
      orderStatus: "pending acceptance",
    });
    const revOrders = await RevOrder.find({
      dAgentId: req.dAgent._id,
      orderStatus: "pending review",
    });
    res.status(201).render("Dagent/dashBoard", {
      pageTitle: "Delivery Agent Dashboard",
      orders: dOrders || [],
      revOrders: revOrders || [],
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getReceiveDorder = async (req, res, next) => {
  const dOrderId = req.params.dOrderId;
  try {
    const dOrder = await Dorder.findById(dOrderId);
    if (!dOrder) {
      throw new Error("no orders found");
    }
    const orderDoc = await dOrder.populate("packages.packageId").execPopulate();
    const packages = orderDoc.packages.map((d) => {
      return { packageId: { ...d.packageId._doc } };
    });
    res.status(200).render("Dagent/receiveOrder", {
      pageTitle: "Receive Order",
      packages: packages,
      orderId: dOrderId,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postReturnPackage = async (req, res, next) => {
  const packageId = req.body.packageId;
  const dOrderId = req.body.dOrderId;
  let packagesArr = [];
  try {
    const package = await Package.findById(packageId);
    if (!package) {
      throw new Error("package is not found");
    }
    package.status = "Processing";
    package.currentPosition = "Operation";
    position = `Operation(${req.dAgent.region})`;
    const date = Date.now();
    await package.save();
    await package.updateTracker(package.status, position, date);
    const dOrder = await Dorder.findById(dOrderId);
    packagesArr = dOrder.packages.filter((p) => {
      return p.packageId.toString() !== packageId.toString();
    });
    dOrder.packages = packagesArr;
    if (dOrder.packages.length === 0) {
      dOrder.orderStatus = "canceled";
      await dOrder.save();
    }
    await dOrder.save();
    res.status(201).json({ message: "returnd" });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postDagentAcceptOrder = async (req, res, next) => {
  const orderId = req.body.orderId;
  try {
    const dOrder = await Dorder.findById(orderId);
    if (!dOrder) {
      throw new Error("order is not found");
    }
    const orderDoc = await dOrder.populate("packages.packageId").execPopulate();
    orderDoc.packages.forEach(async (p) => {
      if (p.packageId.status !== "Dispatch(rejected)") {
        p.packageId.status = "Out-for-delivery";
        p.packageId.currentPosition = "Delivery";
        p.packageId.dAgentId = dOrder.dAgentId;
        position = "Delivery agent";
        date = Date.now();
        await p.packageId.save();
        await p.packageId.updateTracker(p.packageId.status, position, date);
      } else {
        p.packageId.status = "Deliver(rejected)";
        p.packageId.currentPosition = "Delivery";
        p.packageId.dAgentId = dOrder.dAgentId;
        position = "Delivery agent";
        date = Date.now();
        await p.packageId.save();
        await p.packageId.updateTracker(p.packageId.status, position, date);
      }
    });
    dOrder.orderStatus = "accepted";
    await dOrder.save();
    res.status(201).redirect("/dAgent/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getYourPackages = async (req, res, next) => {
  try {
    const dOrder = await Dorder.findOne({
      dAgentId: req.dAgent._id,
      orderStatus: "accepted",
      secured: true,
    });
    if (!dOrder) {
      res.status(200).render("Dagent/showPackages", {
        pageTitle: "Show Packages",
        packages: [],
      });
    }
    const orderDoc = await dOrder.populate("packages.packageId").execPopulate();
    const packages = orderDoc.packages.map((d) => {
      return { packageId: { ...d.packageId._doc } };
    });
    res.status(200).render("Dagent/showPackages", {
      pageTitle: "Show Packages",
      packages: packages,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getDeliverPackage = (req, res, next) => {
  try {
    res
      .status(200)
      .render("Dagent/deliverPackage", { pageTitle: "Deliver Package" });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getPackageData = async (req, res, next) => {
  const barCode = req.body.barCode;
  try {
    const package = await Package.findOne(
      {
        barCode: barCode,
        dAgentId: req.dAgent._id,
      },
      {
        clientName: 1,
        address: 1,
        productName: 1,
        productPrice: 1,
        deliveryFee: 1,
        status: 1,
      }
    );
    if (!package) {
      throw new Error("no package found for this barcode");
    }
    const dOrder = await Dorder.findOne({
      dAgentId: req.dAgent._id,
      secured: true,
      orderStatus: "accepted",
      "packages.packageId": package._id,
    });
    if (!dOrder) {
      throw new Error("no secured orders");
    }
    res.status(201).json({ packageData: package });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postPackageStatus = async (req, res, next) => {
  const barCode = req.body.barCode;
  const status = req.body.status;
  const rejectionReason = req.body.rejectionReason;
  const latitude = req.body.latitude;
  const longitude = req.body.longitude;
  try {
    const package = await Package.findOne({
      barCode: barCode,
      dAgentId: req.dAgent._id,
      status: { $in: ["Out-for-delivery", "Deliver(rejected)"] },
    });
    if (!package) {
      throw new Error("package does not exist");
    }
    if (rejectionReason || status === "Rejected") {
      package.rejectionReason = rejectionReason;
      const sellerDoc = await package.populate("sellerId").execPopulate();
      package.region = sellerDoc.sellerId.region;
      await package.save();
    }
    const position = "Receiver";
    package.status = status;
    package.currentPosition = position;
    const date = Date.now();
    const location = {
      latitude,
      longitude,
    };
    package.geoLocation = location;
    await package.save();
    await package.updateTracker(package.status, position, date);
    if ((package.status = "Rejected")) {
      const io = require("../socket").getIo();
      io.emit("package_rejected", {
        message: "يوجد شحنه تم رفضها",
      });
    }
    if (status === "Delivered" || status === "Returned-to-seller") {
      const dOrder = await Dorder.findOne({
        dAgentId: req.dAgent._id,
        orderStatus: "accepted",
        secured: true,
        "packages.packageId": package._id,
      });
      const remainingPackages = dOrder.packages.filter((pkg) => {
        return pkg.packageId.toString() !== package._id.toString();
      });
      if (remainingPackages.length < 1) {
        dOrder.packages = [];
        dOrder.orderStatus = "closed";
        await dOrder.save();
      } else {
        dOrder.packages = remainingPackages;
        await dOrder.save();
      }
    }
    res.status(201).json({ message: "success" });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getReversedPackages = async (req, res, next) => {
  try {
    const dOrder = await Dorder.findOne({
      dAgentId: req.dAgent._id,
      orderStatus: "accepted",
      secured: true,
    });
    if (!dOrder) {
      throw new Error("no package found for this order");
    }
    const dOrderDoc = await dOrder
      .populate("packages.packageId")
      .execPopulate();
    const packages = [];
    for (let p of dOrderDoc.packages) {
      if (
        p.packageId.status === "Delayed" ||
        p.packageId.status === "Rejected"
      ) {
        packages.push(p.packageId);
      }
    }
    res.status(200).render("Dagent/reversedPackages", {
      pageTitle: "Reversed Packages",
      packages: packages,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postCreateReversedOrder = async (req, res, next) => {
  try {
    const dOrder = await Dorder.findOne({
      dAgentId: req.dAgent._id,
      orderStatus: "accepted",
      secured: true,
    });
    if (!dOrder) {
      throw new Error("no package found for this order");
    }
    const dOrderDoc = await dOrder
      .populate("packages.packageId")
      .execPopulate();
    const packages = [];
    for (let p of dOrderDoc.packages) {
      if (
        p.packageId.status === "Delayed" ||
        p.packageId.status === "Rejected"
      ) {
        packages.push({ packageId: p.packageId._id });
      }
    }
    if (packages.length < 1) {
      throw new Error("No packages to reverse");
    }
    const date = Date.now();
    const revOrder = new RevOrder({
      orderDate: date,
      dAgentId: req.dAgent._id,
      receivingRegion: req.dAgent.region,
      packages: packages,
    });
    await revOrder.save();
    for (let p of packages) {
      const remainingPackages = dOrder.packages.filter((pkg) => {
        return pkg.packageId._id.toString() !== p.packageId.toString();
      });
      if (remainingPackages.length < 1) {
        dOrder.packages = [];
        dOrder.orderStatus = "closed";
        await dOrder.save();
      } else {
        dOrder.packages = remainingPackages;
        await dOrder.save();
      }
    }
    await revOrder.save();
    res.status(201).redirect("/dAgent/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
