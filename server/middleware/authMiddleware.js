const jwt = require("jsonwebtoken");
const SECRET = process.env.JWT_SECRET || "crm_secret_key_2024";

module.exports = function authMiddleware(req, res, next) {
  // Support both "Bearer <token>" and raw token formats
  let token = req.header("Authorization") || req.header("authorization");

  if (!token) {
    return res.status(401).json({ error: "No token, authorization denied" });
  }

  // Strip "Bearer " prefix if present
  if (token.startsWith("Bearer ")) {
    token = token.slice(7).trim();
  }

  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Token is not valid" });
  }
};

