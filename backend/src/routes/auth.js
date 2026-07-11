const express = require("express");
const { body } = require("express-validator");
const {
  register,
  login,
  refreshToken,
  getMe,
  updateProfile,
  logout,
} = require("../controllers/authController");
const { protect } = require("../middleware/auth");

const router = express.Router();

// ─── Validation Rules ─────────────────────────
const registerValidation = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ min: 2, max: 50 })
    .withMessage("Name must be 2–50 characters"),
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters")
    .matches(/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage(
      "Password must contain at least one uppercase, one lowercase, and one number"
    ),
];

const loginValidation = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Please provide a valid email")
    .normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];

// ─── Validation Middleware ────────────────────
const { validationResult } = require("express-validator");
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array().map((e) => e.msg),
    });
  }
  next();
};

// ─── Public Routes ────────────────────────────
router.post("/register", registerValidation, validate, register);
router.post("/login", loginValidation, validate, login);
router.post("/refresh", refreshToken);

// ─── Protected Routes ─────────────────────────
router.get("/me", protect, getMe);
router.patch("/me", protect, updateProfile);
router.post("/logout", protect, logout);

module.exports = router;
