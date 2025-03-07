const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db.config");


// Cookie security options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "Strict",
  maxAge: 60 * 60 * 1000, // 1 hour expiration
};

// Generate Access & Refresh Tokens
const generateTokens = async (userData) => {
  const accessToken = jwt.sign(userData, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRATION,
  });

  const refreshToken = jwt.sign(userData, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });

  // Hash refresh token before storing it for security
  const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);

  try {
    await db.query(
      "UPDATE user_detail SET refresh_token = ? WHERE user_id = ?",
      [hashedRefreshToken, userData.user_id]
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

    const [users] = await db.query(
      "SELECT * FROM user_detail WHERE email = ?",
      [email]
    );
    if (!users.length) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = users[0];

    if (!user.password) {
      return res
        .status(500)
        .json({ message: "Password is missing in the database" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const [userInfo] = await db.query("SELECT * FROM user WHERE user_id = ?", [
      user.user_id,
    ]);
    const userData = { ...user, ...userInfo[0] };

    const payload = {
      user_id: userData.user_id,
      user_role: userData.user_role,
      user_first_name: userData.user_first_name,
      username: userData.username,
    };

    const { accessToken, refreshToken } = await generateTokens(payload);

    res.cookie("refreshToken", refreshToken, cookieOptions, accessToken);

    res.json({
      accessToken,
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

    // Verify the refresh token before checking in DB
    let decoded;
    try {
      decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const [users] = await db.query(
      "SELECT refresh_token FROM user_detail WHERE user_id = ?",
      [decoded.user_id]
    );

    if (!users.length) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const storedTokenHash = users[0].refresh_token;
    const isTokenValid = await bcrypt.compare(refreshToken, storedTokenHash);

    if (!isTokenValid) {
      return res.status(403).json({ message: "Invalid token" });
    }

    const newTokens = await generateTokens(decoded);
    res.cookie("refreshToken", newTokens.refreshToken, cookieOptions);
    res.json({ accessToken: newTokens.accessToken });
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
      await db.query(
        "UPDATE user_detail SET refresh_token = NULL WHERE refresh_token = ?",
        [refreshToken]
      );
    }

    res.clearCookie("refreshToken", { ...cookieOptions, expires: new Date(0) });
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
