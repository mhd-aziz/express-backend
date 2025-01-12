// src/middleware/errorHandler.js
const { sendErrorResponse } = require("../utils/errorUtils");
const logger = require("../utils/logger");

/**
 * Global Error Handling Middleware
 */
const errorHandler = (err, req, res, next) => {

  logger.error(err.stack || err, {
    route: req.originalUrl,
    method: req.method,
    ip: req.ip
  });

  if (res.headersSent) {
    return next(err);
  }

  if (err.status && err.message) {
    return sendErrorResponse(res, err.status, err.message);
  }

  sendErrorResponse(res, 500, "Internal Server Error");
};

module.exports = errorHandler;
