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
      [userId, userData.email, hashedPassword, userData.user_role]
    );
    console.log(userData.user_role);
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

const getUserByEmail = async (email) => {
  try {
    // Retrieve user from user_detail table
    const [users] = await db.query(
      "SELECT * FROM user_detail WHERE email = ?",
      [email]
    );

    if (!users.length) {
      console.log("User not found");
      return null; // Return null if user is not found
    }

   
    const user_id = users[0].user_id;

    // Retrieve user from user table
    const [users2] = await db.query("SELECT * FROM user WHERE user_id = ?", [
      user_id,
    ]);

    // Merge user details
    const userData = { ...users[0], ...(users2[0] || {}) };

  
    return userData;
  } catch (error) {
    console.error("Get User Error:", error);
    return null; // Return null in case of error
  }
};


module.exports = { createUser, getUserByEmail };
