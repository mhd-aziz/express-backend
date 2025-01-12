// src/routes/authRoutes.js
const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

/**
 * @api {post} /auth/register Register a new user
 * @apiName RegisterUser
 * @apiGroup Auth
 *
 * @apiParam (Body) {String} username Username of the user.
 * @apiParam (Body) {String} email Email of the user.
 * @apiParam (Body) {String} password Password of the user.
 *
 * @apiSuccess (201) {String} message User successfully registered.
 *
 * @apiError (400) {String} error Validation failed or user already exists.
 * @apiError (500) {String} error Server error.
 */
router.post(
  "/register",
  [
    body("username")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long."),
    body("email").isEmail().withMessage("Invalid email address."),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ],
  authController.register
);

/**
 * @api {post} /auth/login Login a user
 * @apiName LoginUser
 * @apiGroup Auth
 *
 * @apiParam (Body) {String} email Email of the User.
 * @apiParam (Body) {String} password Password of the User.
 *
 * @apiSuccess (200) {String} token JWT token.
 *
 * @apiError (400) {String} error Invalid email or password.
 * @apiError (500) {String} error Server error.
 */
router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email address."),
    body("password").exists().withMessage("Password is required."),
  ],
  authController.login
);

/**
 * @api {post} /auth/forgot-password Send OTP code for password reset
 * @apiName ForgotPassword
 * @apiGroup Auth
 *
 * @apiParam (Body) {String} email Email of the User.
 *
 * @apiSuccess (200) {String} message OTP code has been sent to your email.
 *
 * @apiError (400) {String} error Invalid email or not registered.
 * @apiError (500) {String} error Server error.
 */
router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Invalid email address.")],
  authController.forgotPassword
);

/**
 * @api {post} /auth/confirm-otp Confirm OTP code for password reset
 * @apiName ConfirmOtp
 * @apiGroup Auth
 *
 * @apiParam (Body) {String} otp OTP code.
 *
 * @apiSuccess (200) {String} message OTP confirmed. Use the reset token to set a new password.
 * @apiSuccess (200) {String} resetToken Reset token.
 *
 * @apiError (400) {String} error Invalid or expired OTP.
 * @apiError (500) {String} error Server error.
 */
router.post(
  "/confirm-otp",
  [
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits."),
  ],
  authController.confirmOtp
);

/**
 * @api {post} /auth/set-new-password Set new password using reset token
 * @apiName SetNewPassword
 * @apiGroup Auth
 *
 * @apiParam (Body) {String} resetToken Reset token.
 * @apiParam (Body) {String} newPassword New password.
 *
 * @apiSuccess (200) {String} message Password has been successfully reset.
 *
 * @apiError (400) {String} error Invalid or expired reset token, or validation failed.
 * @apiError (500) {String} error Server error.
 */
router.post(
  "/set-new-password",
  [
    body("resetToken").notEmpty().withMessage("Reset token is required."),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ],
  authController.setNewPassword
);

/**
 * @api {post} /auth/change-password Change password for authenticated users
 * @apiName ChangePassword
 * @apiGroup Auth
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiParam (Body) {String} oldPassword Old password.
 * @apiParam (Body) {String} confirmOldPassword Confirm old password.
 * @apiParam (Body) {String} newPassword New password.
 *
 * @apiSuccess (200) {String} message Password has been successfully changed.
 *
 * @apiError (400) {String} error Validation failed, incorrect old password, or passwords do not match.
 * @apiError (401) {String} error Unauthorized or invalid token.
 * @apiError (500) {String} error Server error.
 */
router.post(
  "/change-password",
  authMiddleware, // Protect the route
  [
    body("oldPassword")
      .isLength({ min: 6 })
      .withMessage("Old password must be at least 6 characters long."),
    body("confirmOldPassword")
      .isLength({ min: 6 })
      .withMessage(
        "Confirming old password must be at least 6 characters long."
      ),
    body("newPassword")
      .isLength({ min: 6 })
      .withMessage("New password must be at least 6 characters long."),
  ],
  authController.changePassword
);

/**
 * @api {delete} /auth/delete-account Delete user account
 * @apiName DeleteAccount
 * @apiGroup Auth
 *
 * @apiHeader {String} Authorization Bearer token.
 *
 * @apiSuccess (200) {String} message Account has been successfully deleted.
 *
 * @apiError (401) {String} error Unauthorized or invalid token.
 * @apiError (404) {String} error User not found.
 * @apiError (500) {String} error Server error.
 */
router.delete("/delete-account", authMiddleware, authController.deleteAccount);

module.exports = router;
