const express = require("express");
const router = express.Router();
const explainController = require("../controllers/explainController");
const { protect } = require("../middleware/auth");

router.post("/explain", protect, explainController.explainText);

module.exports = router;

