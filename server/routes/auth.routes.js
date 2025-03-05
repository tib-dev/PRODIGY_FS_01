const express = require("express");
const { logout, refreshToken, login } = require("../controller/auth.controller");
const router = express.Router();
const user = require("../controller/user.controller");

router.post("/api/login", login);
router.post("/api/refresh-token", refreshToken);
router.post("/api/logout", logout);
router.post("/api/register", user.createUser);

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
