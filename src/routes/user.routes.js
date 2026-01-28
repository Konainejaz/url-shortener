const express = require("express");
const {
  handleUserSignup,
  handleUserLogin,
  handleUserDashboard,
  handleUserLogout,
  handleViewUserAnalytics,
  handleRenderUserEditPage,
  handleRenderProfilePage,
  handleUpdateProfile,
} = require("../controllers/user.controller");
const { handleDeleteURL, handleUpdateURL } = require("../controllers/url.controller");

const router = express.Router();

// Middleware to protect user routes
const isUser = (req, res, next) => {
  if (req.session.user) return next();
  return res.redirect("/login");
};

router.get("/signup", (req, res) => res.render("signup"));
router.post("/signup", handleUserSignup);

router.get("/login", (req, res) => res.render("login"));
router.post("/login", handleUserLogin);

router.get("/dashboard", isUser, handleUserDashboard);
router.get("/logout", handleUserLogout);

router.get("/analytics/:shortID", isUser, handleViewUserAnalytics);
router.get("/edit/:shortID", isUser, handleRenderUserEditPage);
router.post("/edit/:shortID", isUser, handleUpdateURL);
router.post("/delete/:shortID", isUser, handleDeleteURL);

// Profile Management
router.get("/profile", isUser, handleRenderProfilePage);
router.post("/profile", isUser, handleUpdateProfile);

module.exports = router;