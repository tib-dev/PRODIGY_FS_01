//Import express module
const express = require("express");
// call the router method
const router = express.Router();
const authRouter = require("./auth.routes");

router.use(authRouter);

module.exports = router;
