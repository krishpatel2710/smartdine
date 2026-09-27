/**
 * Centralized API response helpers to ensure consistent JSON formats
 */

const successResponse = (res, statusCode = 200, message = "Success", data = null) => {
  const response = {
    success: true,
    message
  };

  if (data !== null) {
    response.data = data;
  }

  return res.status(statusCode).json(response);
};

const errorResponse = (res, statusCode = 500, message = "Server Error", error = null) => {
  const response = {
    success: false,
    message
  };

  if (error && process.env.NODE_ENV === "development") {
    response.error = typeof error === "string" ? error : error.message || error;
  }

  return res.status(statusCode).json(response);
};

module.exports = {
  successResponse,
  errorResponse
};
