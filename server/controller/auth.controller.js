const db = require("../config/db.config");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// Create a new user
const createUser = async (req, res) => {
  try {
    const { username, first_name, last_name, password, email } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const [rows] = await db.query(
      "INSERT INTO user (username, password, first_name, last_name, email) VALUES (?, ?, ?, ?, ?)",
      [username, hashedPassword, first_name, last_name, email]
    );

    res.status(201).json({ id: rows.insertId, username });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// User login
const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;
    const [rows] = await db.query("SELECT * FROM user WHERE username = ?", [
      username,
    ]);

    if (rows.length === 0) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { createUser, loginUser };
