const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const db = require("../config/db.config");

// Cookie security options
const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production", // Only secure in production
  sameSite: "Strict",
};

// Generate Access & Refresh Tokens
const generateTokens = async (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: process.env.TOKEN_EXPIRATION,
  });

  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
  });

  try {
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
   console.log(user);
   
    if (!user.password) {
      return res
        .status(500)
        .json({ message: "Password is missing in the database" });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const { accessToken, refreshToken } = await generateTokens(user.user_id);

    res.cookie("refreshToken", refreshToken, cookieOptions);
    res.json({ accessToken, role: user.user_role  }); // Default role if null
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// Refresh Token (Token Rotation)
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken)
      return res.status(401).json({ message: "No token provided" });

    const users = await db.query(
      "SELECT * FROM user_detail WHERE refresh_token = ?",
      [refreshToken]
    );
    if (!users.length)
      return res.status(403).json({ message: "Invalid token" });

    jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET,
      async (err, decoded) => {
        if (err) return res.status(403).json({ message: "Invalid token" });

        const user = users[0];

        // Generate new tokens
        const newTokens = await generateTokens(user.user_id);
        res.cookie("refreshToken", newTokens.refreshToken, cookieOptions);
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

    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
