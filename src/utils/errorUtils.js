// src/utils/errorUtils.js

/**
 * Send standardized error response
 * @param {Object} res - Express response object
 * @param {Number} statusCode - HTTP status code
 * @param {String} message - Error message
 */
const sendErrorResponse = (res, statusCode, message) => {
  return res.status(statusCode).json({ error: message });
};

module.exports = {
  sendErrorResponse,
};
