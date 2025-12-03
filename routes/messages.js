const express = require("express");
const router = express.Router();
const {
  sendMessage,
  markMessagesAsRead,
} = require("../controllers/messageController");
const { protect } = require("../middleware/auth");

router.post("/:chatId/messages", protect, sendMessage);
router.post("/:chatId/read", protect, markMessagesAsRead);

module.exports = router;
