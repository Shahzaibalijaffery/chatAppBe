const express = require("express");
const router = express.Router();
const { createUploadUrl } = require("../controllers/uploadController");
const { protect } = require("../middleware/auth");

router.post("/presign", protect, createUploadUrl);

module.exports = router;

