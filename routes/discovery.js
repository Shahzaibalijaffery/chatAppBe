const express = require("express");
const router = express.Router();
const {
  getNearby,
  refreshNearby,
  getExplore,
} = require("../controllers/discoveryController");
const { protect } = require("../middleware/auth");

router.post("/nearby/refresh", protect, refreshNearby);
router.get("/nearby", protect, getNearby);
router.get("/explore", protect, getExplore);

module.exports = router;
