// src/middleware/authMiddleware.js
const { verifyToken } = require("../utils/jwtUtils");
const { sendErrorResponse } = require("../utils/errorUtils");
require("dotenv").config();

/**
 * Middleware to authenticate JWT tokens
 */
const authMiddleware = (req, res, next) => {
  // Get the token from the Authorization header
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return sendErrorResponse(res, 401, "Authorization header missing.");
  }

  // The header format should be "Bearer <token>"
  const token = authHeader.split(" ")[1];

  if (!token) {
    return sendErrorResponse(res, 401, "Token missing.");
  }

  try {
    // Verify the token
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded token to request object
    next(); // Proceed to the next middleware or route handler
  } catch (error) {
    return sendErrorResponse(res, 401, "Invalid or expired token.");
  }
};

module.exports = authMiddleware;
