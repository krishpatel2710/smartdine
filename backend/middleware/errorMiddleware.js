const { errorResponse } = require("../utils/response");

/**
 * 404 Not Found Middleware
 */
const notFoundHandler = (req, res, next) => {
  return errorResponse(res, 404, `API route not found: ${req.method} ${req.originalUrl}`);
};

/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  console.error("🔥 [Unhandled Error]:", err);

  const statusCode = err.statusCode || (res.statusCode === 200 ? 500 : res.statusCode);
  const message = err.message || "An unexpected internal server error occurred";

  return errorResponse(res, statusCode, message, err);
};

module.exports = {
  notFoundHandler,
  errorHandler
};
