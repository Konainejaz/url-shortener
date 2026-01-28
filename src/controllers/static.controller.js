const URL = require("../models/url.model");

async function handleRenderHomePage(req, res) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  return res.redirect("/dashboard");
}

module.exports = {
  handleRenderHomePage,
};
