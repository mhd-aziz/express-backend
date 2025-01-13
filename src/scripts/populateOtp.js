const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function main() {
  const passwordResets = await prisma.passwordReset.findMany();

  for (const reset of passwordResets) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const hashedOTP = await bcrypt.hash(otp, 10);
    await prisma.passwordReset.update({
      where: { id: reset.id },
      data: { otp: hashedOTP },
    });
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
