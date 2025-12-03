const express = require("express");
const router = express.Router();
const {
  getAllChats,
  getChatById,
  createChat,
} = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getAllChats);
router.get("/:chatId", protect, getChatById);
router.post("/", protect, createChat);

module.exports = router;
