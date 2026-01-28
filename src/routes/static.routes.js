const express = require("express");
const { handleRenderHomePage } = require("../controllers/static.controller");

const router = express.Router();

router.get("/", handleRenderHomePage);

module.exports = router;
