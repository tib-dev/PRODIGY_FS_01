const express = require("express");
const router = express.Router();
const auth = require("../controller/auth.controller");

router.post("/api/register", auth.createUser);
router.post("/api/login", auth.loginUser);

module.exports = router;
