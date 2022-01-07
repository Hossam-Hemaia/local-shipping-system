module.exports = {
  headOfficeAuth: (req, res, next) => {
    if (!req.session.headOfficeLoggedIn) {
      res.redirect("/hq/login");
    }
    next();
  },
  rAgentAuth: (req, res, next) => {
    if (!req.session.rAgentLoggedIn) {
      res.redirect("/rAgent/login");
    }
    next();
  },
  dAgentAuth: (req, res, next) => {
    if (!req.session.dAgentLoggedIn) {
      res.redirect("/dAgent/login");
    }
    next();
  },
  secAgentAuth: (req, res, next) => {
    if (!req.session.secAgentLoggedIn) {
      res.redirect("/secAgent/login");
    }
    next();
  },
  sellerAuth: (req, res, next) => {
    if (!req.session.sellerLoggedIn) {
      res.redirect("/seller/login");
    }
    next();
  },
  cAgentAuth: (req, res, next) => {
    if (!req.session.cAgentLoggedIn) {
      res.redirect("/cAgent/login");
    }
    next();
  },
};
