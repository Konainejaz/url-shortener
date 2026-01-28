require("dotenv").config();
const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcrypt");
const connectDB = require("./src/config/db");
const { logRequests } = require("./src/middlewares/logger.middleware");

const urlRoutes = require("./src/routes/url.routes");
const staticRoutes = require("./src/routes/static.routes");
const adminRoutes = require("./src/routes/admin.routes");
const userRoutes = require("./src/routes/user.routes");
const { handleRedirect } = require("./src/controllers/url.controller");
const Admin = require("./src/models/admin.model");

const app = express();
const PORT = process.env.PORT || 8000;

const isAtlasMongoUri = (uri) => typeof uri === "string" && uri.includes("mongodb.net");

const mongoUri = process.env.MONGODB_URI;
const shouldConnectToDb = process.env.SKIP_DB_CONNECT !== "1";
if (shouldConnectToDb) {
  if (!mongoUri) {
    throw new Error("MONGODB_URI environment variable is required");
  }
  if (!isAtlasMongoUri(mongoUri)) {
    throw new Error("MONGODB_URI must be a MongoDB Atlas connection string (mongodb.net)");
  }
}

if (shouldConnectToDb) {
  connectDB(mongoUri).then(async () => {
    const defaultAdminUsername = process.env.ADMIN_USERNAME || "admin";
    const defaultAdminPassword = process.env.ADMIN_PASSWORD || "admin123";
    const adminExists = await Admin.findOne({ username: defaultAdminUsername });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);
      await Admin.create({ username: defaultAdminUsername, password: hashedPassword });
      console.log(`Default admin created: ${defaultAdminUsername}`);
    }
  });
}

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.resolve("./src/views"));
if (process.env.VERCEL) {
  app.set("trust proxy", 1);
}

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
const sessionOptions = {
  secret: process.env.SESSION_SECRET || "url-shortener-dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: !!process.env.VERCEL,
  },
};

if (shouldConnectToDb) {
  sessionOptions.store = (MongoStore.create || MongoStore.default.create)({
    mongoUrl: mongoUri,
    collectionName: "sessions",
    ttl: 24 * 60 * 60,
  });
}

app.use(session(sessionOptions));
app.use(logRequests("server.log"));

// Routes
app.use("/", staticRoutes);
app.use("/", userRoutes);
app.use("/url", urlRoutes);
app.use("/admin", adminRoutes);
app.get("/:shortID", handleRedirect);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

module.exports = app;
