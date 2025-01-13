const express = require("express");
const { body } = require("express-validator");
const router = express.Router();
const authController = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

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

router.post(
  "/login",
  [
    body("email").isEmail().withMessage("Invalid email address."),
    body("password").exists().withMessage("Password is required."),
  ],
  authController.login
);

router.post(
  "/forgot-password",
  [body("email").isEmail().withMessage("Invalid email address.")],
  authController.forgotPassword
);

router.post(
  "/confirm-otp",
  [
    body("otp")
      .isLength({ min: 6, max: 6 })
      .withMessage("OTP must be 6 digits."),
  ],
  authController.confirmOtp
);

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

router.post(
  "/change-password",
  authMiddleware,
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

router.delete("/delete-account", authMiddleware, authController.deleteAccount);

module.exports = router;
