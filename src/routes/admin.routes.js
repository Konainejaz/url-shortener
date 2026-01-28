const express = require("express");
const {
  handleAdminLogin,
  handleAdminDashboard,
  handleAdminLogout,
  handlePasswordReset,
  handleRenderEditPage,
  handleViewAnalytics,
  handleViewUsers,
  handleDeleteUser,
  handleRenderEditUserPage,
  handleUpdateUser,
} = require("../controllers/admin.controller");
const {
  handleDeleteURL,
  handleUpdateURL,
} = require("../controllers/url.controller");

const router = express.Router();

// Middleware to protect admin routes
const isAdmin = (req, res, next) => {
  if (req.session.isAdmin) return next();
  return res.redirect("/admin/login");
};

router.get("/", (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect("/admin/dashboard");
  }
  return res.redirect("/admin/login");
});

router.get("/login", (req, res) => res.render("admin/login"));
router.post("/login", handleAdminLogin);

router.get("/dashboard", isAdmin, handleAdminDashboard);
router.get("/logout", handleAdminLogout);

router.get("/reset", isAdmin, (req, res) => res.render("admin/reset"));
router.post("/reset", isAdmin, handlePasswordReset);

// CRUD operations for URLs
router.post("/delete/:shortID", isAdmin, handleDeleteURL);
router.get("/edit/:shortID", isAdmin, handleRenderEditPage);
router.post("/edit/:shortID", isAdmin, handleUpdateURL);
router.get("/analytics/:shortID", isAdmin, handleViewAnalytics);

// User Management
router.get("/users", isAdmin, handleViewUsers);
router.get("/users/edit/:id", isAdmin, handleRenderEditUserPage);
router.post("/users/edit/:id", isAdmin, handleUpdateUser);
router.post("/users/delete/:id", isAdmin, handleDeleteUser);

module.exports = router;
