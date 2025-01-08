// src/config/env.js
require("dotenv").config();

const ENV = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  RESET_PASSWORD_SECRET: process.env.RESET_PASSWORD_SECRET,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
};

module.exports = ENV;
