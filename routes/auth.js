const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  register,
  login,
  getMe,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");
const { validate } = require("../middleware/validate");
const { GENDERS } = require("../constants/gender");

// Validation rules
const registerValidation = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),
  body("age")
    .isInt({ min: 18, max: 120 })
    .withMessage("Age must be between 18 and 120"),
  body("gender")
    .isIn(GENDERS)
    .withMessage("Gender must be male, female, or other"),
];

const loginValidation = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please provide a valid email"),
  body("password").notEmpty().withMessage("Password is required"),
];

router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.get("/me", protect, getMe);
router.post("/logout", protect, logout);

module.exports = router;
