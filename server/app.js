const express = require("express");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const expressSanitizer = require("express-sanitizer");
const cors = require("cors");

const corsOptions = {
  origin: process.env.FRONT_END_URL,
  credentials: true, // 🔥 Important for cookies/tokens
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
};

const port = process.env.PORT || 5000;
const router = require("./routes"); // Ensure routes are defined properly
const app = express();

app.use(cookieParser());
app.use(cors(corsOptions));
app.use(express.json());
app.use(expressSanitizer()); // Replaced incorrect 'sanitize' usage
app.use(router);
// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Internal Server Error" });
});

// Server listening
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

module.exports = app;
