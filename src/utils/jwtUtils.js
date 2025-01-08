// src/utils/jwtUtils.js
const jwt = require("jsonwebtoken");
const { sendErrorResponse } = require("./errorUtils");
require("dotenv").config();

/**
 * Generate JWT Token
 * @param {Object} payload - Payload to encode in the token
 * @param {String} secret - Secret key for signing
 * @param {String} expiresIn - Token expiration time
 * @returns {String} - Signed JWT token
 */
const generateToken = (payload, secret, expiresIn) => {
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Verify JWT Token
 * @param {String} token - JWT token to verify
 * @param {String} secret - Secret key for verification
 * @returns {Object} - Decoded token payload
 */
const verifyToken = (token, secret) => {
  return jwt.verify(token, secret);
};

module.exports = {
  generateToken,
  verifyToken,
};
