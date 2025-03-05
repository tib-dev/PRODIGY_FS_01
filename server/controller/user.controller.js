const db = require("../config/db.config");
const bcrypt = require("bcryptjs");

const createUser = async (userData) => {
  const connection = await db.getConnection(); // Get DB connection for transactions
  await connection.beginTransaction(); // Start transaction

  try {
    // Check if user already exists
    const [existingUser] = await connection.query(
      "SELECT * FROM user WHERE email = ?",
      [userData.email]
    );
    if (existingUser.length > 0) {
      await connection.release();
      return { error: "User already exists" };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(userData.password, 10);

    // Insert into `user` table
    const [userRow] = await connection.query(
      "INSERT INTO user (username, user_first_name, user_last_name) VALUES (?, ?, ?)",
      [userData.username, userData.user_first_name, userData.user_last_name]
    );

    const userId = userRow.insertId;

    // Insert into `user_detail` table
    await connection.query(
      "INSERT INTO user_detail (user_id, email, password, role) VALUES (?, ?, ?, ?)",
      [userId, userData.email, hashedPassword, userData.role]
    );

    // Commit transaction if both queries succeed
    await connection.commit();
    await connection.release();

    return { success: true, userId };
  } catch (error) {
    await connection.rollback(); // Rollback transaction if any error occurs
    await connection.release();
    return {
      error: "An error occurred while creating the user",
      details: error.message,
    };
  }
};

module.exports = { createUser };
