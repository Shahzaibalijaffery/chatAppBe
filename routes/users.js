const express = require("express");
const router = express.Router();
const { getAllUsers, updateUser } = require("../controllers/userController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getAllUsers);
router.patch("/:userId", protect, updateUser);

module.exports = router;
