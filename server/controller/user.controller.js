const db = require("../config/db.config");
const bcrypt = require("bcryptjs");

const createUser = async (req, res) => {
  const userData = req.body;
  try {
    // Check if the email already exists in user_detail
    const [existingUser] = await db.query(
      "SELECT user_id FROM user_detail WHERE email = ?",
      [userData.email]
    );
    if (existingUser.length) {
      return res
        .status(400)
        .json({ error: "User with this email already exists" });
    }

    // Ensure password is provided
    if (!userData.password || userData.password.trim() === "") {
      return res.status(400).json({ error: "Password is required" });
    }

    // Generate salt
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);

    // Hash the password with salt
    const hashedPassword = await bcrypt.hash(userData.password, salt);

    // Insert user into `user` table
    const [userRow] = await db.query(
      "INSERT INTO user (username, user_first_name, user_last_name) VALUES (?, ?, ?)",
      [userData.username, userData.user_first_name, userData.user_last_name]
    );

    const userId = userRow.insertId;

    // Insert user details into `user_detail`
    await db.query(
      "INSERT INTO user_detail (user_id, email, password, user_role) VALUES (?, ?, ?, ?)",
      [userId, userData.email, hashedPassword, userData.user_role] // default role is 'user' if not provided
    );
   
    return res
      .status(201)
      .json({ success: true, userId, message: "User created successfully" });
  } catch (error) {
    console.error("Create User Error:", error); // Log error for debugging
    return res.status(500).json({
      error: "An error occurred while creating the user. Please try again.",
    });
  }
};

module.exports = { createUser };
