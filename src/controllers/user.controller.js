const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const URL = require("../models/url.model");

async function handleUserSignup(req, res) {
  const { name, email, password } = req.body;
  
  // Check if email already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.render("signup", { error: "Email already exists. Please use a different email or login." });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({
      name,
      email,
      password: hashedPassword,
    });
    return res.redirect("/login");
  } catch (error) {
    return res.render("signup", { error: "An error occurred during signup. Please try again." });
  }
}

async function handleUserLogin(req, res) {
  const { email, password } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return res.render("login", { error: "Invalid email or password" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.render("login", { error: "Invalid email or password" });
  }

  req.session.user = {
    id: user._id,
    name: user.name,
    email: user.email,
  };
  return res.redirect("/dashboard");
}

async function handleUserDashboard(req, res) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const userUrls = await URL.find({ createdBy: req.session.user.id, createdByType: "User" });
  return res.render("dashboard", { 
    urls: userUrls, 
    user: req.session.user,
    id: req.query.id // Pass the newly created ID if it exists in the query string
  });
}

async function handleUserLogout(req, res) {
  req.session.destroy();
  return res.redirect("/login");
}

async function handleViewUserAnalytics(req, res) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const shortID = req.params.shortID;
  const urlEntry = await URL.findOne({ shortID, createdBy: req.session.user.id });
  if (!urlEntry) {
    return res.redirect("/dashboard");
  }
  return res.render("user-analytics", { url: urlEntry, user: req.session.user });
}

async function handleRenderUserEditPage(req, res) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const shortID = req.params.shortID;
  const urlEntry = await URL.findOne({ shortID, createdBy: req.session.user.id });
  if (!urlEntry) {
    return res.redirect("/dashboard");
  }
  return res.render("user-edit", { url: urlEntry, user: req.session.user });
}

async function handleRenderProfilePage(req, res) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const user = await User.findById(req.session.user.id);
  return res.render("profile", { user, success: null, error: null });
}

async function handleUpdateProfile(req, res) {
  if (!req.session.user) {
    return res.redirect("/login");
  }
  const { name, password } = req.body;
  const user = await User.findById(req.session.user.id);

  try {
    const updateData = { name };
    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }
    
    await User.findByIdAndUpdate(req.session.user.id, updateData);
    
    // Update session info
    req.session.user.name = name;
    
    return res.render("profile", { 
      user: { ...user._doc, name }, 
      success: "Profile updated successfully!", 
      error: null 
    });
  } catch (error) {
    return res.render("profile", { 
      user, 
      success: null, 
      error: "Failed to update profile. Please try again." 
    });
  }
}

module.exports = {
  handleUserSignup,
  handleUserLogin,
  handleUserDashboard,
  handleUserLogout,
  handleViewUserAnalytics,
  handleRenderUserEditPage,
  handleRenderProfilePage,
  handleUpdateProfile,
};
