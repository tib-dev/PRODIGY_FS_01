const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieOptions = { httpOnly: true, secure: true, sameSite: "Strict" };

// Generate Access & Refresh Tokens
const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { userId: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.TOKEN_EXPIRATION }
  );

  const refreshToken = jwt.sign(
    { userId: user.user_id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRATION }
  );

  return { accessToken, refreshToken };
};

// User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  const user = await db.query("SELECT * FROM user_detail WHERE email = ?", [email]);
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const { accessToken, refreshToken } = generateTokens(user);

  // Securely store refresh token in HTTP-only cookie
  res.cookie("refreshToken", refreshToken, cookieOptions);

  res.json({ accessToken, role: user.role });
};

// Refresh Token (Token Rotation)
exports.refreshToken = (req, res) => {
  const { refreshToken } = req.cookies;
  if (!refreshToken) return res.status(401).json({ message: "No token" });

  jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET, (err, decoded) => {
    if (err) return res.status(403).json({ message: "Invalid token" });

    const newTokens = generateTokens({ user_id: decoded.userId });
    res.cookie("refreshToken", newTokens.refreshToken, cookieOptions);
    res.json({ accessToken: newTokens.accessToken });
  });
};

// Logout (Clear refresh token)
exports.logout = (req, res) => {
  res.clearCookie("refreshToken");
  res.json({ message: "Logged out" });
};
