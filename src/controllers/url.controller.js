const { nanoid } = require("nanoid");
const URL = require("../models/url.model");
const Admin = require("../models/admin.model");

async function handleGenerateNewShortURL(req, res) {
  const body = req.body;
  if (!body.Url) {
    return res.status(400).json({ error: "URL is required" });
  }

  let shortId = body.customID;
  
  // If custom ID provided, check for duplicates
  if (shortId && shortId.trim() !== "") {
    const existing = await URL.findOne({ shortID: shortId });
    if (existing) {
      // Handle error based on where the request came from
      const errorMsg = "Custom ID already in use. Please choose another.";
      if (body.redirect === "/admin/dashboard") {
        const allUrls = await URL.find({}).populate("createdBy");
        return res.render("admin/dashboard", { urls: allUrls, error: errorMsg });
      } else if (body.redirect === "/dashboard") {
        const userUrls = await URL.find({ createdBy: req.session.user.id, createdByType: "User" });
        return res.render("dashboard", { urls: userUrls, user: req.session.user, error: errorMsg });
      } else {
        return res.render("home", { error: errorMsg, user: req.session.user });
      }
    }
  } else {
    shortId = nanoid(8);
  }
  
  let createdBy, createdByType;
  if (req.session.isAdmin) {
    // We need to find the admin ID. Since we don't store admin ID in session currently, 
    // let's just find the first admin for now or update admin login to store ID.
    const admin = await Admin.findOne({ username: "admin" }); // Assuming default admin
    createdBy = admin._id;
    createdByType = "Admin";
  } else if (req.session.user) {
    createdBy = req.session.user.id;
    createdByType = "User";
  } else {
    return res.status(401).json({ error: "Please login to create short URL" });
  }

  await URL.create({
    shortID: shortId,
    originalUrl: body.Url,
    visitHistory: [],
    createdBy,
    createdByType,
  });

  if (body.redirect) {
    // If we're redirecting back to dashboard, we might want to pass the new ID in query
    const redirectPath = body.redirect.includes("?") 
      ? `${body.redirect}&id=${shortId}` 
      : `${body.redirect}?id=${shortId}`;
    return res.redirect(redirectPath);
  }

  return res.render("home", {
    id: shortId,
    user: req.session.user,
  });
}

async function handleGetAnalytics(req, res) {
  const shortID = req.params.shortID;
  const result = await URL.findOne({ shortID });
  
  if (!result) {
    return res.status(404).json({ error: "URL not found" });
  }

  return res.json({
    totalClicks: result.visitHistory.length,
    analytics: result.visitHistory,
  });
}

async function handleRedirect(req, res) {
  const shortID = req.params.shortID;
  const entry = await URL.findOneAndUpdate(
    { shortID },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
          userAgent: req.headers["user-agent"],
        },
      },
    },
    { new: true }
  );

  if (!entry) {
    return res.status(404).send("URL not found");
  }

  return res.redirect(entry.originalUrl);
}

async function handleDeleteURL(req, res) {
  const shortID = req.params.shortID;
  await URL.findOneAndDelete({ shortID });
  
  if (req.session.isAdmin) {
    return res.redirect("/admin/dashboard");
  }
  return res.redirect("/dashboard");
}

async function handleUpdateURL(req, res) {
  const oldShortID = req.params.shortID;
  const { originalUrl, newShortID } = req.body;

  // Check if new shortID is provided and different from the old one
  if (newShortID && newShortID !== oldShortID) {
    // Duplication check
    const existing = await URL.findOne({ shortID: newShortID });
    if (existing) {
      const errorMsg = "Short ID already in use. Please choose another.";
      const urlEntry = await URL.findOne({ shortID: oldShortID });
      
      if (req.session.isAdmin) {
        return res.render("admin/edit", { url: urlEntry, error: errorMsg });
      } else {
        return res.render("user-edit", { url: urlEntry, error: errorMsg });
      }
    }
    
    // Update both shortID and originalUrl
    await URL.findOneAndUpdate({ shortID: oldShortID }, { shortID: newShortID, originalUrl });
  } else {
    // Only update originalUrl
    await URL.findOneAndUpdate({ shortID: oldShortID }, { originalUrl });
  }
  
  if (req.session.isAdmin) {
    return res.redirect("/admin/dashboard");
  }
  return res.redirect("/dashboard");
}

module.exports = {
  handleGenerateNewShortURL,
  handleGetAnalytics,
  handleRedirect,
  handleDeleteURL,
  handleUpdateURL,
};
