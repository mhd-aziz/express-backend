const prisma = require("../prisma");
const { hashPassword, comparePasswords } = require("../utils/passwordUtils");
const { generateToken, verifyToken } = require("../utils/jwtUtils");
const { sendEmail } = require("../utils/emailUtils");
const { sendErrorResponse } = require("../utils/errorUtils");

const registerUser = async (userData) => {
  const { username, email, password } = userData;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ email }, { username }],
    },
  });

  if (existingUser) {
    throw { status: 400, message: "Username or email is already in use." };
  }

  const hashedPassword = await hashPassword(password);

  await prisma.user.create({
    data: {
      username,
      email,
      password: hashedPassword,
    },
  });

  return { message: "User successfully registered." };
};

const loginUser = async (loginData) => {
  const { email, password } = loginData;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw { status: 400, message: "Invalid email or password." };
  }

  const isMatch = await comparePasswords(password, user.password);
  if (!isMatch) {
    throw { status: 400, message: "Invalid email or password." };
  }

  const token = generateToken(
    { userId: user.id },
    process.env.JWT_SECRET,
    "1h"
  );

  return token;
};

const forgotPassword = async (email) => {
  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw { status: 400, message: "Email is not registered." };
  }

  const otp = Math.floor(100000 + Math.random() * 900000).toString();

  const hashedOTP = await hashPassword(otp);
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

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

  await sendEmail(
    user.email,
    "OTP Code for Password Reset",
    `Your OTP code is: ${otp}. This code is valid for 10 minutes.`
  );

  return { message: "OTP code has been sent to your email." };
};

const confirmOtp = async (otp) => {
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

const setNewPassword = async (resetToken, newPassword) => {
  try {
    const decoded = verifyToken(resetToken, process.env.RESET_PASSWORD_SECRET);
    const userId = decoded.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw { status: 400, message: "User not found." };
    }

    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

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

const changePassword = async (
  userId,
  oldPassword,
  confirmOldPassword,
  newPassword
) => {
  if (oldPassword !== confirmOldPassword) {
    throw { status: 400, message: "Old passwords do not match." };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw { status: 404, message: "User not found." };
  }

  const isMatch = await comparePasswords(oldPassword, user.password);
  if (!isMatch) {
    throw { status: 400, message: "Old password is incorrect." };
  }

  const hashedNewPassword = await hashPassword(newPassword);

  await prisma.user.update({
    where: { id: user.id },
    data: { password: hashedNewPassword },
  });

  return { message: "Password has been successfully changed." };
};

const deleteAccount = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw { status: 404, message: "User not found." };
  }

  await prisma.passwordReset.deleteMany({
    where: { userId },
  });

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
