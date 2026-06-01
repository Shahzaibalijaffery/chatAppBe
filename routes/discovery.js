const express = require("express");
const router = express.Router();
const {
  getNearby,
  refreshNearby,
} = require("../controllers/discoveryController");
const { protect } = require("../middleware/auth");

router.post("/nearby/refresh", protect, refreshNearby);
router.get("/nearby", protect, getNearby);

module.exports = router;
