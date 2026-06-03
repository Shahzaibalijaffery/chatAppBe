const express = require("express");
const router = express.Router();
const {
  createPost,
  getFeed,
  getPostDetail,
  getMyPosts,
  addComment,
  setReaction,
  removeReaction,
  requestMessage,
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");

router.get("/feed", protect, getFeed);
router.get("/mine", protect, getMyPosts);
router.post("/", protect, createPost);
router.get("/:postId", protect, getPostDetail);
router.post("/:postId/comments", protect, addComment);
router.put("/:postId/reactions", protect, setReaction);
router.delete("/:postId/reactions", protect, removeReaction);
router.post("/:postId/message-request", protect, requestMessage);

module.exports = router;
