// scripts/populateOtp.js
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const passwordResets = await prisma.passwordReset.findMany();

  for (const reset of passwordResets) {
    // Generate OTP 6 digit
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Hash OTP
    const hashedOTP = await bcrypt.hash(otp, 10);

    // Update entry with hashed OTP
    await prisma.passwordReset.update({
      where: { id: reset.id },
      data: { otp: hashedOTP },
    });

    // For debugging purposes, print the OTP
    console.log(`Updated PasswordReset id=${reset.id} with OTP=${otp}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
