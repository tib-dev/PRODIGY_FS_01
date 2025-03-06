const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db.config");

// Cookie security options
const cookieOptions = {
  httpOnly: true, // Prevents JavaScript access to cookies
  secure: process.env.NODE_ENV === "production", // Secure cookies only in production
  sameSite: "Strict", // Prevents sending cookies in cross-site requests (can also be 'Lax' depending on use case)
  maxAge: 60 * 60 * 1000, // 1 hour expiration for refresh token cookies, adjust as needed
};

// Generate Access & Refresh Tokens
const generateTokens = async (userId) => {
  // Create the access token with expiration
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRATION,
  });

  // Create the refresh token with expiration
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });

  try {
    // Save refresh token in DB
    await db.query(
      "UPDATE user_detail SET refresh_token = ? WHERE user_id = ?",
      [refreshToken, userId]
    );
  } catch (error) {
    console.error("Error saving refresh token:", error);
  }

  return { accessToken, refreshToken };
};

// User Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    const userQuery = "SELECT * FROM user_detail WHERE email = ?";
    const [users] = await db.query(userQuery, [email]);

    if (!users.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];
    const userQuery2 = "SELECT * FROM user WHERE user_id = ?";
    const [users2] = await db.query(userQuery2, [user.user_id]);

  const userData = {
    ...users[0], // Use the first item in the users array
    ...users2[0], // Merge the first item from users2 array
  };

    // Ensure the user has a password
    if (!user.password) {
      return res
        .status(500)
        .json({ message: "Password is missing in the database" });
    }

    // Compare provided password with stored hashed password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate tokens for the user
    const { accessToken, refreshToken } = await generateTokens(user.user_id);

    // Set refresh token in HttpOnly cookie
    res.cookie("refreshToken", refreshToken, cookieOptions);
  
    res.json({
      accessToken,user_first_name:
     userData.user_first_name

    });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Refresh Token (Token Rotation)
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Verify the refresh token
    const users = await db.query(
      "SELECT * FROM user_detail WHERE refresh_token = ?",
      [refreshToken]
    );
    if (!users.length) {
      return res.status(403).json({ message: "Invalid token" });
    }

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });

        const user = users[0];

        // Generate new access and refresh tokens
        const newTokens = await generateTokens(user.user_id);

        // Set the new refresh token in the cookie
        res.cookie("refreshToken", newTokens.refreshToken, cookieOptions);

        // Respond with the new access token
        res.json({ accessToken: newTokens.accessToken });
      }
    );
  } catch (error) {
    console.error("Refresh Token Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Logout (Clear refresh token)
exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (refreshToken) {
      // Invalidate refresh token in DB
      await db.query(
        "UPDATE user_detail SET refresh_token = NULL WHERE refresh_token = ?",
        [refreshToken]
      );
    }

    // Clear the refresh token cookie
    res.clearCookie("refreshToken", cookieOptions);
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
