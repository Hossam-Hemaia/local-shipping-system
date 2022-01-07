const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Seller = require("../models/seller");
const Ragent = require("../models/rAgent");
const Dagent = require("../models/dAgent");
const Order = require("../models/order");
const SecAgent = require("../models/security");
const Hoffice = require("../models/hOffice");
const Package = require("../models/package");
const Cagent = require("../models/cAgent");
const utils = require("../utils/utilities");

exports.getSellerRegister = (req, res, next) => {
  res.render("auth/sellerAuth/register", { pageTitle: "Seller Register" });
};

exports.postSellerRegister = async (req, res, next) => {
  const {
    name,
    address,
    phoneNumber,
    niche,
    region,
    sellerPass,
    userName,
  } = req.body;
  try {
    let seller = await Seller.findOne({ userName: userName });
    if (seller) {
      return res.redirect("/seller/register");
    }
    const sellerCode = crypto.randomBytes(8).toString("hex");
    const password = await bcrypt.hash(sellerPass, 12);
    seller = new Seller({
      name,
      userName,
      address,
      phoneNumber,
      niche,
      region,
      sellerCode,
      password: password,
    });
    req.session.seller = seller;
    req.session.sellerLoggedIn = true;
    await seller.save();
    res.status(201).redirect("/seller/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getSellerLogin = (req, res, next) => {
  res
    .status(200)
    .render("auth/sellerAuth/login", { pageTitle: "Seller Login" });
};

exports.postSellerLogin = async (req, res, next) => {
  const { userName, password } = req.body;
  try {
    const seller = await Seller.findOne({ userName: userName });
    if (!seller) {
      return res.redirect("/seller/login");
    }
    const doMatch = await bcrypt.compare(password, seller.password);
    if (!doMatch) {
      return res.redirect("/seller/login");
    }
    req.session.seller = seller;
    req.session.sellerLoggedIn = true;
    const orders = await Order.find(
      { sellerId: seller._id },
      { orderStatus: 1, date: 1 }
    );
    if (!orders) {
      res.status(201).redirect("/seller/dashBoard");
    }
    res.status(201).redirect("/seller/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getDagentOnlineCreate = async (req, res, next) => {
  try {
    res.status(201).render("auth/dAgentAuth/createDagent", {
      pageTitle: "Create Delivery Agent",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postDagentOnlineCreate = async (req, res, next) => {
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
  } = req.body;
  try {
    let dAgent = await Dagent.findOne({ idNumber: idNumber });
    if (dAgent) {
      throw new Error("this delivery agent is already created!");
    }
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
    });
    await dAgent.save();
    res.status(200).redirect("/");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getRagentLogin = (req, res, next) => {
  res
    .status(200)
    .render("auth/rAgentAuth/login", { pageTitle: "Region Agent Login" });
};

exports.postRagentLogin = async (req, res, next) => {
  const { userName, password } = req.body;
  try {
    const rAgent = await Ragent.findOne({ userName: userName });
    if (!rAgent) {
      return res.redirect("/rAgent/login");
    }
    const doMatch = await bcrypt.compare(password, rAgent.password);
    if (!doMatch) {
      return res.redirect("/rAgent/login");
    }
    req.session.rAgent = rAgent;
    req.session.rAgentLoggedIn = true;
    res.status(201).redirect("/rAgent/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postLogout = async (req, res, next) => {
  await req.session.destroy((err) => {
    res.redirect("/");
  });
};

exports.getDagentLogin = (req, res, next) => {
  res
    .status(200)
    .render("auth/dAgentAuth/login", { pageTitle: "Delivery Agent Login" });
};

exports.postDagentLogin = async (req, res, next) => {
  const { userName, password } = req.body;
  try {
    const dAgent = await Dagent.findOne({ userName: userName });
    if (!dAgent) {
      return res.redirect("/dAgent/login");
    }
    const doMatch = await bcrypt.compare(password, dAgent.password);
    if (!doMatch) {
      return res.redirect("/dAgent/login");
    }
    req.session.dAgent = dAgent;
    req.session.dAgentLoggedIn = true;
    res.status(201).redirect("/dAgent/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getSecAgentLogin = (req, res, next) => {
  res
    .status(200)
    .render("auth/security/login", { pageTitle: "Security Agent Login" });
};

exports.postSecAgentLogin = async (req, res, next) => {
  const { userName, password } = req.body;
  try {
    const secAgent = await SecAgent.findOne({ userName: userName });
    if (!secAgent) {
      return res.redirect("/secAgent/login");
    }
    const doMatch = await bcrypt.compare(password, secAgent.password);
    if (!doMatch) {
      return res.redirect("/secAgent/login");
    }
    req.session.secAgent = secAgent;
    req.session.secAgentLoggedIn = true;
    res.status(201).redirect("/secAgent/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getcAgentLogin = (req, res, next) => {
  res
    .status(200)
    .render("auth/cAgent/login", { pageTitle: "Call Agent Login" });
};

exports.postcAgentLogin = async (req, res, next) => {
  const { userName, password } = req.body;
  try {
    const cAgent = await Cagent.findOne({ userName: userName });
    if (!cAgent) {
      return res.redirect("/cAgent/login");
    }
    const doMatch = await bcrypt.compare(password, cAgent.password);
    if (!doMatch) {
      return res.redirect("/cAgent/login");
    }
    req.session.cAgent = cAgent;
    req.session.cAgentLoggedIn = true;
    res.status(201).redirect("/cAgent/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getHeadOfficeCreate = (req, res, next) => {
  res
    .status(200)
    .render("auth/headOfficeAuth/createAdmin", { pageTitle: "Create Admin" });
};

exports.postHeadOfficeCreate = async (req, res, next) => {
  const { name, phoneNumber, userName, password } = req.body;
  try {
    let hOffice = await Hoffice.findOne({ userName: userName });
    if (hOffice) {
      throw new Error("admin is already created");
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    hOffice = new Hoffice({
      name,
      phoneNumber,
      userName,
      password: hashedPassword,
    });
    await hOffice.save();
    res.status(201).redirect("/hq/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getHeadOfficeLogin = (req, res, next) => {
  res
    .status(200)
    .render("auth/headOfficeAuth/login", { pageTitle: "Head Office Login" });
};

exports.postHeadOfficeLogin = async (req, res, next) => {
  const { userName, password } = req.body;
  try {
    const hOffice = await Hoffice.findOne({ userName: userName });
    if (!hOffice) {
      return res.redirect("/headOffice/login");
    }
    const doMatch = await bcrypt.compare(password, hOffice.password);
    if (!doMatch) {
      return res.redirect("/headOffice/login");
    }
    req.session.headOffice = hOffice;
    req.session.headOfficeLoggedIn = true;
    res.status(201).redirect("/hq/dashBoard");
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getPackageTracking = (req, res, next) => {
  const barCode = req.params.barCode;
  try {
    res.status(200).render("track", {
      pageTitle: "Tracking Package",
      barCode: barCode || "",
    });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.getYourTcode = (req, res, next) => {
  res
    .status(200)
    .render("getYourTcode", { pageTitle: "Get Your Tracking Code" });
};

exports.postPackagesCodes = async (req, res, next) => {
  const { date, region } = req.body;
  try {
    const isoDate = utils.toIsoDate(date, "start");
    const isoDateTo = utils.toIsoDate(date, "");
    const packages = await Package.find(
      {
        region: region,
        "tracker.transactionDate": { $gte: isoDate, $lte: isoDateTo },
        "tracker.packageStatus": { $in: "Processing" },
      },
      { clientName: 1, address: 1, barCode: 1 }
    );
    if (!packages) {
      res.status(201).json({ message: "no packages found" });
    }
    res.status(201).json({ packages: packages });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};

exports.postPackageTracking = async (req, res, next) => {
  const barCode = req.body.barCode;
  try {
    const package = await Package.findOne(
      { barCode: barCode },
      {
        clientName: 1,
        address: 1,
        productName: 1,
        productPrice: 1,
        deliveryFee: 1,
        status: 1,
        tracker: 1,
        geoLocation: 1,
      }
    );
    if (!package) {
      throw new Error("this package does not exist");
    }
    res.status(201).json({ package: package });
  } catch (err) {
    const error = new Error(err);
    error.httpStatusCode = 500;
    return next(error);
  }
};
