require("dotenv").config();
const express = require("express");
const app = express();
app.use(express.urlencoded({ extended: false }));
app.use(express.json());
const userApiRoutes = require("./routes/users(rest)");
const userRoutes = require("./routes/users");
const connectDB = require("./connection");
const { serverLogs } = require("./middlewares");

app.use(serverLogs("server.log"));

const requireDb = async (req, res, next) => {
  if (!process.env.MONGODB_URI) {
    if (req.path.startsWith("/api/")) {
      return res.status(500).json({ error: "Missing MONGODB_URI" });
    }
    return res
      .status(500)
      .send(
        "Missing MONGODB_URI. Set it in your environment (or Vercel env vars) to use /users and /api/users.",
      );
  }
  try {
    await connectDB(process.env.MONGODB_URI);
    next();
  } catch (err) {
    next(err);
  }
};

//routes
app.route("/").get((req, res) => {
  res.send("Hello World!");
});
app.use("/users", requireDb, userRoutes);
app.use("/api/users", requireDb, userApiRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  if (req.path.startsWith("/api/")) {
    return res.status(500).json({ error: "Internal Server Error" });
  }
  res.status(500).send("Internal Server Error");
});

const port = process.env.PORT || 8000;
if (require.main === module) {
  app.listen(port, () => {
    console.log(`Server is running`);
  });
}

module.exports = app;
