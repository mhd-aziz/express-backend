// src/middleware/errorHandler.js
const { sendErrorResponse } = require("../utils/errorUtils");
const logger = require("../utils/logger");

/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {
  // Log the error details
  logger.error(err.stack || err);

  // If headers have already been sent, delegate to the default Express error handler
  if (res.headersSent) {
    return next(err);
  }

  // Handle known errors
  if (err.status && err.message) {
    return sendErrorResponse(res, err.status, err.message);
  }

  // Handle unknown errors
  sendErrorResponse(res, 500, "Internal Server Error");
};

module.exports = errorHandler;
