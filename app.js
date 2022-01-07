const fs = require("fs");
const path = require("path");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDbStore = require("connect-mongodb-session")(session);
const csrf = require("csurf");
const flash = require("connect-flash");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const Ragent = require("./models/rAgent");
const Dagent = require("./models/dAgent");
const SecAgent = require("./models/security");
const Seller = require("./models/seller");
const Cagent = require("./models/cAgent");
const Hoffice = require("./models/hOffice");

const sellerRouter = require("./routes/seller");
const hqRouter = require("./routes/hq");
const authRouter = require("./routes/auth");
const rAgentRouter = require("./routes/rAgent");
const dAgentRouter = require("./routes/dAgent");
const secRouter = require("./routes/security");
const cAgentRouter = require("./routes/cAgent");

const errorController = require("./controllers/errors");

const app = express();
//mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@SG-weGoProduction-42345.servers.mongodirector.com:27017/${process.env.MONGO_DATABASE}
const MONGODB_URI = `mongodb://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@SG-weGoProduction-42345.servers.mongodirector.com:27017/${process.env.MONGO_DATABASE}`;
const store = new MongoDbStore({
  uri: MONGODB_URI,
  collection: "sessions",
});

const csfrProtection = csrf();
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, "access.log"),
  { flags: "a" }
);

app.set("view engine", "ejs");
app.set("views", "views");

app.use(helmet());
app.use(compression());
app.use(morgan("combined", { stream: accessLogStream }));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));
app.use(
  session({
    secret: "in The Name of Allah Most grecious most Mercifull - this is weGo",
    saveUninitialized: false,
    resave: false,
    store: store,
  })
);

app.use(csfrProtection);
app.use(flash());

app.use(async (req, res, next) => {
  if (!req.session.seller) {
    return next();
  }
  try {
    const seller = await Seller.findById(req.session.seller._id);
    req.seller = seller;
    next();
  } catch (err) {
    console.log(err);
  }
});

app.use(async (req, res, next) => {
  if (!req.session.rAgent) {
    return next();
  }
  try {
    const rAgent = await Ragent.findById(req.session.rAgent._id);
    req.rAgent = rAgent;
    next();
  } catch (err) {
    console.log(err);
  }
});

app.use(async (req, res, next) => {
  if (!req.session.dAgent) {
    return next();
  }
  try {
    const dAgent = await Dagent.findById(req.session.dAgent._id);
    req.dAgent = dAgent;
    next();
  } catch (err) {
    console.log(err);
  }
});

app.use(async (req, res, next) => {
  if (!req.session.secAgent) {
    return next();
  }
  try {
    const secAgent = await SecAgent.findById(req.session.secAgent._id);
    req.secAgent = secAgent;
    next();
  } catch (err) {
    console.log(err);
  }
});

app.use(async (req, res, next) => {
  if (!req.session.cAgent) {
    return next();
  }
  try {
    const cAgent = await Cagent.findById(req.session.cAgent._id);
    req.cAgent = cAgent;
    next();
  } catch (err) {
    console.log(err);
  }
});

app.use(async (req, res, next) => {
  if (!req.session.headOffice) {
    return next();
  }
  try {
    const headOffice = await Hoffice.findById(req.session.headOffice._id);
    req.headOffice = headOffice;
    next();
  } catch (err) {
    console.log(err);
  }
});

app.use((req, res, next) => {
  res.locals.sellerAuthenticated = req.session.sellerLoggedIn;
  res.locals.rAgentAuthenticated = req.session.rAgentLoggedIn;
  res.locals.dAgentAuthenticated = req.session.dAgentLoggedIn;
  res.locals.secAgentAuthenticated = req.session.secAgentLoggedIn;
  res.locals.headOfficeAuthenticated = req.session.headOfficeLoggedIn;
  res.locals.cAgentAuthenticated = req.session.cAgentLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});
app.use(authRouter);
app.use(sellerRouter);
app.use(hqRouter);
app.use(rAgentRouter);
app.use(dAgentRouter);
app.use(secRouter);
app.use(cAgentRouter);

app.get("/", (req, res, next) => {
  res.status(200).render("home", { pageTitle: "HOME" });
});

//app.use("/500", errorController.get500);
app.use(errorController.getNotFound);
app.use((error, req, res, next) => {
  console.log(error);
  res.redirect("/500");
});

mongoose
  .connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then((result) => {
    const server = app.listen(5000, "127.0.0.1", () => {
      console.log("listening on port 5000");
    });
    const io = require("./socket").ioInit(server);
    io.on("connection", (socket) => {
      console.log("client connected!");
    });
  })
  .catch((err) => {
    console.log(err);
  });
