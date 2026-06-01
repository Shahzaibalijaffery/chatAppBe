const express = require("express");
const router = express.Router();
const {
  getMatches,
  getMatchWithUser,
  requestChat,
  respondToRequest,
} = require("../controllers/matchController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getMatches);
router.get("/with/:otherUserId", protect, getMatchWithUser);
router.post("/request", protect, requestChat);
router.post("/:matchId/respond", protect, respondToRequest);

module.exports = router;
