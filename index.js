if (!process.env.VERCEL) {
  require("dotenv").config();
}
const path = require("path");
const express = require("express");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const bcrypt = require("bcryptjs");
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
const isVercel = !!process.env.VERCEL;
const shouldConnectToDb = process.env.SKIP_DB_CONNECT !== "1";
const sessionSecret = process.env.SESSION_SECRET || (isVercel ? undefined : "url-shortener-dev-secret");

let configError = null;
if (shouldConnectToDb) {
  if (!mongoUri) {
    configError = new Error("MONGODB_URI environment variable is required");
  } else if (!isAtlasMongoUri(mongoUri)) {
    configError = new Error("MONGODB_URI must be a MongoDB Atlas connection string (mongodb.net)");
  } else if (!sessionSecret) {
    configError = new Error("SESSION_SECRET environment variable is required");
  }
}

let initPromise = null;
const ensureInitialized = async () => {
  if (!shouldConnectToDb || configError) return;
  if (!initPromise) {
    initPromise = connectDB(mongoUri).then(async () => {
      const defaultAdminUsername = process.env.ADMIN_USERNAME || "admin";
      const defaultAdminPassword = process.env.ADMIN_PASSWORD || "admin123";
      const adminExists = await Admin.findOne({ username: defaultAdminUsername });
      if (!adminExists) {
        const hashedPassword = await bcrypt.hash(defaultAdminPassword, 10);
        await Admin.create({ username: defaultAdminUsername, password: hashedPassword });
        console.log(`Default admin created: ${defaultAdminUsername}`);
      }
    }).catch((err) => {
      configError = err;
    });
  }
  await initPromise;
};

// View Engine Setup
app.set("view engine", "ejs");
app.set("views", path.resolve("./src/views"));
if (process.env.VERCEL) {
  app.set("trust proxy", 1);
}

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(async (req, res, next) => {
  if (configError) {
    return res.status(500).send(`Server misconfigured: ${configError.message}`);
  }
  if (!shouldConnectToDb) return next();
  await ensureInitialized();
  if (configError) {
    return res.status(500).send(`Server failed to initialize: ${configError.message}`);
  }
  return next();
});

const sessionOptions = {
  secret: sessionSecret || "url-shortener-dev-secret",
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 24 * 60 * 60 * 1000,
    httpOnly: true,
    secure: !!process.env.VERCEL,
  },
};

if (shouldConnectToDb && !configError) {
  const store = (MongoStore.create || MongoStore.default.create)({
    mongoUrl: mongoUri,
    collectionName: "sessions",
    ttl: 24 * 60 * 60,
  });
  store.on("error", (err) => {
    configError = err;
  });
  sessionOptions.store = store;
}

app.use(session(sessionOptions));
app.use(logRequests("server.log"));

// Routes
app.use("/", staticRoutes);
app.use("/", userRoutes);
app.use("/url", urlRoutes);
app.use("/admin", adminRoutes);
app.get("/favicon.ico", (req, res) => res.status(204).end());
app.get("/:shortID", handleRedirect);

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
  });
}

app.use((err, req, res, next) => {
  console.error(err);
  if (res.headersSent) return next(err);
  return res.status(500).send("Internal Server Error");
});

module.exports = app;
