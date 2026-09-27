const { errorResponse } = require("../utils/response");

/**
 * Restrict endpoint access to specific roles
 * @param  {...string} roles Allowed roles ('admin', 'kitchen', 'customer')
 */
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return errorResponse(res, 401, "Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      return errorResponse(
        res,
        403,
        `Forbidden: Access denied for role '${req.user.role}'. Required: [${roles.join(", ")}]`
      );
    }

    next();
  };
};

module.exports = {
  restrictTo
};
