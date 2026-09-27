const { verifyToken } = require("../utils/token");
const { errorResponse } = require("../utils/response");
const pool = require("../config/db");

/**
 * Protect routes - Verifies JWT Bearer token and attaches user to req.user
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return errorResponse(res, 401, "Not authorized, no token provided");
  }

  try {
    const decoded = verifyToken(token);

    // Verify user still exists in database
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?",
      [decoded.id]
    );

    if (rows.length === 0) {
      return errorResponse(res, 401, "User belonging to this token no longer exists");
    }

    req.user = rows[0];
    next();
  } catch (err) {
    return errorResponse(res, 401, "Not authorized, invalid or expired token", err);
  }
};

/**
 * Optional Auth - Attaches user if valid token present, but does not block if not
 */
const optionalAuth = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const decoded = verifyToken(token);
    const [rows] = await pool.query(
      "SELECT id, name, email, phone, role, created_at FROM users WHERE id = ?",
      [decoded.id]
    );

    if (rows.length > 0) {
      req.user = rows[0];
    } else {
      req.user = null;
    }
  } catch (err) {
    req.user = null;
  }

  next();
};

module.exports = {
  protect,
  optionalAuth
};
