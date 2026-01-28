const express = require("express");
const {
  handleGenerateNewShortURL,
  handleGetAnalytics,
} = require("../controllers/url.controller");

const router = express.Router();

router.post("/", handleGenerateNewShortURL);
router.get("/analytics/:shortID", handleGetAnalytics);

module.exports = router;
