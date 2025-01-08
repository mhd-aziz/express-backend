// src/services/authService.js
const prisma = require("../prisma");
const { hashPassword, comparePasswords } = require("../utils/passwordUtils");
const { generateToken, verifyToken } = require("../utils/jwtUtils");
const { sendEmail } = require("../utils/emailUtils");
const { sendErrorResponse } = require("../utils/errorUtils");

/**
 * Register a new user
 * @param {Object} userData - User registration data
 * @returns {Object} - Result of registration
 */
const registerUser = async (userData) => {
  const { username, email, password } = userData;

  // Check if email or username is already in use
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    throw { status: 400, message: "Username or email is already in use." };
  }

  // Hash password
  const hashedPassword = await hashPassword(password);

  // Create new user
  await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  return { message: "User successfully registered." };
};

/**
 * Login a user
 * @param {Object} loginData - User login data
 * @returns {String} - JWT token
 */
const loginUser = async (loginData) => {
  const { email, password } = loginData;

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw { status: 400, message: "Invalid email or password." };
  }

  // Check password
  const isMatch = await comparePasswords(password, user.password);
  if (!isMatch) {
    throw { status: 400, message: "Invalid email or password." };
  }

  // Create JWT token
  const token = generateToken(
    { userId: user.id },
    process.env.JWT_SECRET,
    "1h"
  );

  return token;
};

/**
 * Handle forgot password by sending OTP
 * @param {String} email - User email
 * @returns {String} - Success message
 */
const forgotPassword = async (email) => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw { status: 400, message: "Email is not registered." };
  }

  // Generate 6-digit OTP
  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  // Hash OTP
  const hashedOTP = await hashPassword(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes

  // Save OTP to database
  await prisma.passwordReset.upsert({
    where: { userId: user.id },
    update: {
      otp: hashedOTP,
      expiresAt,
    },
    create: {
      userId: user.id,
      otp: hashedOTP,
      expiresAt,
    },
  });

  // Send OTP via email
  await sendEmail(
    user.email,
    "OTP Code for Password Reset",
    `Your OTP code is: ${otp}. This code is valid for 10 minutes.`
  );

  return { message: "OTP code has been sent to your email." };
};

/**
 * Confirm OTP and generate reset token
 * @param {String} otp - OTP code
 * @returns {String} - Reset token
 */
const confirmOtp = async (otp) => {
  // Find all non-expired PasswordReset records
  const passwordResets = await prisma.passwordReset.findMany({
    where: {
      expiresAt: {
        gt: new Date(),
      },
    },
    include: {
      user: true,
    },
  });

  // Iterate through passwordResets to find a matching OTP
  let matchedPasswordReset = null;
  let matchedUser = null;

  for (const reset of passwordResets) {
    const isOTPValid = await comparePasswords(otp, reset.otp);
    if (isOTPValid) {
      matchedPasswordReset = reset;
      matchedUser = reset.user;
      break;
    }
  }

  if (!matchedPasswordReset) {
    throw { status: 400, message: "Invalid or expired OTP code." };
  }

  // Generate a reset token (JWT)
  const resetToken = generateToken(
    { userId: matchedUser.id },
    process.env.RESET_PASSWORD_SECRET,
    "15m"
  );

  return {
    message: "OTP confirmed. Use the reset token to set a new password.",
    resetToken,
  };
};

/**
 * Set new password using reset token
 * @param {String} resetToken - JWT reset token
 * @param {String} newPassword - New password
 * @returns {String} - Success message
 */
const setNewPassword = async (resetToken, newPassword) => {
  try {
    // Verify the reset token
    const decoded = verifyToken(resetToken, process.env.RESET_PASSWORD_SECRET);
    const userId = decoded.userId;

    // Find the user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw { status: 400, message: "User not found." };
    }

    // Hash new password
    const hashedPassword = await hashPassword(newPassword);

    // Update user password
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    // Delete the PasswordReset entry
    await prisma.passwordReset.delete({
      where: { userId: userId },
    });

    return { message: "Password has been successfully reset." };
  } catch (error) {
    if (
      error.name === "JsonWebTokenError" ||
      error.name === "TokenExpiredError"
    ) {
      throw { status: 400, message: "Invalid or expired reset token." };
    }
    throw error;
  }
};

/**
 * Change password for authenticated user
 * @param {String} userId - ID of the authenticated user
 * @param {String} oldPassword - Current password
 * @param {String} confirmOldPassword - Confirmation of current password
 * @param {String} newPassword - New password
 * @returns {String} - Success message
 */
const changePassword = async (
  userId,
  oldPassword,
  confirmOldPassword,
  newPassword
) => {
  // Check if oldPassword and confirmOldPassword match
  if (oldPassword !== confirmOldPassword) {
    throw { status: 400, message: "Old passwords do not match." };
  }

  // Retrieve user from the database
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw { status: 404, message: "User not found." };
  }

  // Compare provided oldPassword with stored hashed password
  const isMatch = await comparePasswords(oldPassword, user.password);
  if (!isMatch) {
    throw { status: 400, message: "Old password is incorrect." };
  }

  // Hash the new password
  const hashedNewPassword = await hashPassword(newPassword);

  // Update user's password in the database
  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  });

  return { message: "Password has been successfully changed." };
};

/**
 * Delete user account
 * @param {Number} userId - ID of the authenticated user
 * @returns {Object} - Success message
 */
const deleteAccount = async (userId) => {
  // Cek apakah pengguna ada
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw { status: 404, message: "User not found." };
  }

  // Hapus entitas PasswordReset terkait terlebih dahulu
  await prisma.passwordReset.deleteMany({
    where: { userId },
  });

  // Hapus pengguna dari database
  await prisma.user.delete({
    where: { id: userId },
  });

  return { message: "Account has been successfully deleted." };
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  confirmOtp,
  setNewPassword,
  changePassword,
  deleteAccount,
};
