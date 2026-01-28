const bcrypt = require("bcrypt");
const Admin = require("../models/admin.model");
const URL = require("../models/url.model");
const User = require("../models/user.model");

async function handleAdminLogin(req, res) {
  const { username, password } = req.body;
  const admin = await Admin.findOne({ username });

  if (!admin) {
    return res.render("admin/login", { error: "Invalid username or password" });
  }

  const isMatch = await bcrypt.compare(password, admin.password);
  if (!isMatch) {
    return res.render("admin/login", { error: "Invalid username or password" });
  }

  req.session.isAdmin = true;
  req.session.adminId = admin._id;
  return res.redirect("/admin/dashboard");
}

async function handleAdminDashboard(req, res) {
  if (!req.session.isAdmin) {
    return res.redirect("/admin/login");
  }
  // Ensure User model is loaded for population
  const allUrls = await URL.find({}).populate("createdBy");
  return res.render("admin/dashboard", { urls: allUrls });
}

async function handleAdminLogout(req, res) {
  req.session.destroy();
  return res.redirect("/admin/login");
}

async function handlePasswordReset(req, res) {
  const { username, newPassword } = req.body;
  const hashedPassword = await bcrypt.hash(newPassword, 10);
  
  const admin = await Admin.findOneAndUpdate(
    { username },
    { password: hashedPassword },
    { new: true }
  );

  if (!admin) {
    return res.render("admin/reset", { error: "Admin user not found" });
  }

  return res.render("admin/reset", { success: "Password updated successfully!" });
}

async function handleRenderEditPage(req, res) {
  if (!req.session.isAdmin) {
    return res.redirect("/admin/login");
  }
  const shortID = req.params.shortID;
  const urlEntry = await URL.findOne({ shortID });
  if (!urlEntry) {
    return res.redirect("/admin/dashboard");
  }
  return res.render("admin/edit", { url: urlEntry });
}

async function handleViewAnalytics(req, res) {
  if (!req.session.isAdmin) {
    return res.redirect("/admin/login");
  }
  const shortID = req.params.shortID;
  const urlEntry = await URL.findOne({ shortID }).populate("createdBy");
  if (!urlEntry) {
    return res.redirect("/admin/dashboard");
  }
  return res.render("admin/analytics", { url: urlEntry });
}

async function handleViewUsers(req, res) {
  if (!req.session.isAdmin) {
    return res.redirect("/admin/login");
  }
  const users = await User.find({});
  return res.render("admin/users", { users });
}

async function handleDeleteUser(req, res) {
  if (!req.session.isAdmin) {
    return res.redirect("/admin/login");
  }
  const userId = req.params.id;
  await User.findByIdAndDelete(userId);
  // Also delete all URLs created by this user
  await URL.deleteMany({ createdBy: userId, createdByType: "User" });
  return res.redirect("/admin/users");
}

async function handleRenderEditUserPage(req, res) {
  if (!req.session.isAdmin) {
    return res.redirect("/admin/login");
  }
  const userId = req.params.id;
  const user = await User.findById(userId);
  if (!user) {
    return res.redirect("/admin/users");
  }
  return res.render("admin/edit-user", { user });
}

async function handleUpdateUser(req, res) {
  if (!req.session.isAdmin) {
    return res.redirect("/admin/login");
  }
  const userId = req.params.id;
  const { name, email } = req.body;

  // Check if new email is already taken by another user
  const existingUser = await User.findOne({ email, _id: { $ne: userId } });
  if (existingUser) {
    const user = await User.findById(userId);
    return res.render("admin/edit-user", { 
      user, 
      error: "Email is already in use by another user." 
    });
  }

  await User.findByIdAndUpdate(userId, { name, email });
  return res.redirect("/admin/users");
}

module.exports = {
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
};
