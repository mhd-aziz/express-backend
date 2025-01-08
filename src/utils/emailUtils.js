// src/utils/emailUtils.js
const nodemailer = require("nodemailer");
require("dotenv").config();

/**
 * Send an email
 * @param {String} to - Recipient email address
 * @param {String} subject - Email subject
 * @param {String} text - Email body
 */
const sendEmail = async (to, subject, text) => {
  // Configure your email transporter (Example uses Gmail SMTP)
  const transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: process.env.EMAIL_USER, // Your email address
      pass: process.env.EMAIL_PASS, // Your email password or app password
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmail,
};
