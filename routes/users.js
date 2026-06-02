const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getPublicUser,
  touchActive,
  updateUser,
  updateMyLocation,
  updateLocation,
  blockUser,
  reportUser,
  registerFcmToken,
  removeFcmToken,
} = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getAllUsers);
router.get("/:userId", protect, getPublicUser);
router.post("/me/location", protect, updateMyLocation);
router.post("/me/active", protect, touchActive);
router.post("/me/fcm-token", protect, registerFcmToken);
router.delete("/me/fcm-token", protect, removeFcmToken);
router.patch("/:userId", protect, updateUser);
router.post("/:userId/location", protect, updateLocation);
router.post("/:targetUserId/block", protect, blockUser);
router.post("/:targetUserId/report", protect, reportUser);

module.exports = router;
