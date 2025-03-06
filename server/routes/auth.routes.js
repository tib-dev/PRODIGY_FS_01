const express = require("express");
const {
  logout,
  refreshToken,
  login,
} = require("../controller/auth.controller");
const router = express.Router();
const user = require("../controller/user.controller");
const {
  authenticateToken,
  authorizeRoles,
} = require("../middlewares/middleware");
const { body, validationResult } = require("express-validator");

// Validation middleware for register
router.post(
  "/api/user/register",
  [
    body("email").isEmail().withMessage("Invalid email address"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 8 characters long"),
    body("username").notEmpty().withMessage("Username is required"),
    body("user_first_name").notEmpty().withMessage("First name is required"),
    body("user_last_name").notEmpty().withMessage("Last name is required"),
    (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      next();
    },
  ],
  user.createUser
);

router.post("/api/auth/login", login);
router.post("/api/auth/refresh-token", refreshToken);
router.post("/api/auth/logout", logout);

// Protected Route (Only for Admins)
router.get(
  "/api/admin",
  authenticateToken,
  authorizeRoles("admin"),
  (req, res) => {
    res.json({ message: "Admin access granted" });
  }
);

module.exports = router;
