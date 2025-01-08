// src/controllers/authController.js
const authService = require("../services/authService");
const { sendErrorResponse } = require("../utils/errorUtils");

/**
 * Register User Controller
 */
const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json(result);
  } catch (error) {
    if (error.status && error.message) {
      sendErrorResponse(res, error.status, error.message);
    } else {
      next(error);
    }
  }
};

/**
 * Login User Controller
 */
const login = async (req, res, next) => {
  try {
    const token = await authService.loginUser(req.body);
    res.json({ token });
  } catch (error) {
    if (error.status && error.message) {
      sendErrorResponse(res, error.status, error.message);
    } else {
      next(error);
    }
  }
};

/**
 * Forgot Password Controller
 */
const forgotPassword = async (req, res, next) => {
  try {
    const result = await authService.forgotPassword(req.body.email);
    res.json(result);
  } catch (error) {
    if (error.status && error.message) {
      sendErrorResponse(res, error.status, error.message);
    } else {
      next(error);
    }
  }
};

/**
 * Confirm OTP Controller
 */
const confirmOtp = async (req, res, next) => {
  try {
    const result = await authService.confirmOtp(req.body.otp);
    res.json(result);
  } catch (error) {
    if (error.status && error.message) {
      sendErrorResponse(res, error.status, error.message);
    } else {
      next(error);
    }
  }
};

/**
 * Set New Password Controller
 */
const setNewPassword = async (req, res, next) => {
  try {
    const { resetToken, newPassword } = req.body;
    const result = await authService.setNewPassword(resetToken, newPassword);
    res.json(result);
  } catch (error) {
    if (error.status && error.message) {
      sendErrorResponse(res, error.status, error.message);
    } else {
      next(error);
    }
  }
};

/**
 * Change Password Controller
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, confirmOldPassword, newPassword } = req.body;
    const userId = req.user.userId;

    const result = await authService.changePassword(
      userId,
      oldPassword,
      confirmOldPassword,
      newPassword
    );

    res.json(result);
  } catch (error) {
    if (error.status && error.message) {
      sendErrorResponse(res, error.status, error.message);
    } else {
      next(error);
    }
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  confirmOtp,
  setNewPassword,
  changePassword,
};
