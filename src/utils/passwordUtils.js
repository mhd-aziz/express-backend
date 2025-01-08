// src/utils/passwordUtils.js
const bcrypt = require("bcrypt");

/**
 * Hash a plain text password
 * @param {String} password - Plain text password
 * @returns {String} - Hashed password
 */
const hashPassword = async (password) => {
  return await bcrypt.hash(password, 10);
};

/**
 * Compare a plain text password with a hashed password
 * @param {String} plainPassword - Plain text password
 * @param {String} hashedPassword - Hashed password
 * @returns {Boolean} - Result of comparison
 */
const comparePasswords = async (plainPassword, hashedPassword) => {
  return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
  hashPassword,
  comparePasswords,
};
