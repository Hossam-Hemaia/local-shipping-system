const Dorder = require("../models/dOrder");
const Rorder = require("../models/rOrder");
const Dagent = require("../models/dAgent");
const Package = require("../models/package");

exports.getSecurtiyDashboard = async (req, res, next) => {
  try {
    const dOrders = await Dorder.find({
      orderStatus: "accepted",
      orderRegion: req.secAgent.region,
      secured: false,
    });
    const rOrders = await Rorder.find({
      orderStatus: "pending review",
      orderRegion: req.secAgent.region,
      secured: false,
    });
    const orders = dOrders.concat(rOrders);
    res.status(201).render("security/dashBoard", {
      pageTitle: "Dash-board",
      orders: orders,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getSecurity = async (req, res, next) => {
  const type = req.params.type;
  try {
    const dAgents = await Dagent.find({ region: req.secAgent.region });
    let rOrderSec = false;
    if (type) {
      rOrderSec = true;
    }
    res.status(200).render("security/security", {
      pageTitle: "Security",
      dAgents: dAgents,
      rOrders: rOrderSec,
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postSecurity = async (req, res, next) => {
  const dAgentId = req.body.dAgentId;
  const fetchType = req.body.fetchType;
  try {
    let packagesNumber = 0;
    if (fetchType === "regions") {
      const rOrders = await Rorder.find({
        dAgentId: dAgentId,
        orderStatus: "pending review",
        secured: false,
      });
      for (let order of rOrders) {
        packagesNumber += order.packages.length;
      }
    } else {
      const dOrders = await Dorder.find({
        dAgentId: dAgentId,
        orderStatus: "accepted",
        secured: false,
      });
      if (!dOrders) {
        throw new Error("No orders found for this delivery agent");
      }
      for (let order of dOrders) {
        packagesNumber += order.packages.length;
      }
    }
    res.status(201).json({ inputsNumber: packagesNumber, dAgentId: dAgentId });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postSecurityCheckPackages = async (req, res, next) => {
  const dAgentId = req.body.dAgentId;
  const fetchType = req.body.fetchType;
  try {
    const pkgCodes = [];
    if (fetchType === "regions") {
      const rOrders = await Rorder.find({
        dAgentId: dAgentId,
        orderStatus: "pending review",
        secured: false,
      });
      for (let order of rOrders) {
        let orderDoc = await order
          .populate("packages.packageId")
          .execPopulate();
        orderDoc.packages.forEach((p) => {
          pkgCodes.push(p.packageId.barCode);
        });
      }
    } else {
      const packages = await Package.find({
        dAgentId: dAgentId,
        status: { $in: ["Out-for-delivery", "Deliver(rejected)"] },
      });
      if (!packages) {
        throw new Error("no packages found for this agent");
      }
      for (let pkg of packages) {
        pkgCodes.push(pkg.barCode);
      }
    }
    res.status(201).json({ codes: pkgCodes });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postSecAgentCheckPassed = async (req, res, next) => {
  const dAgentId = req.body.dAgentId;
  const fetchType = req.body.fetchType;
  try {
    if (fetchType === "regions") {
      const rOrders = await Rorder.find({
        dAgentId: dAgentId,
        orderStatus: "pending review",
        secured: false,
      });
      for (let order of rOrders) {
        order.secured = true;
        await order.save();
      }
    } else {
      const dOrders = await Dorder.find({
        dAgentId: dAgentId,
        orderStatus: "accepted",
        secured: false,
      });
      if (!dOrders) {
        return res.status(422).json({ message: "faild" });
      }
      for (let order of dOrders) {
        order.secured = true;
        await order.save();
      }
    }
    res.status(200).json({ message: "success" });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
