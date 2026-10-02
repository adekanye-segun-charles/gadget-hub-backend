require("dotenv").config({ path: require("path").resolve(__dirname, "../.env") });

const prisma = require("../gadget-hub-backend/config/database");

const createAdmin = async () => {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const currentEmail = process.env.ADMIN_CURRENT_EMAIL?.trim().toLowerCase();

  if (!email || !currentEmail) {
    throw new Error("Set ADMIN_CURRENT_EMAIL and ADMIN_EMAIL in the root .env file.");
  }

  const existingAdmin = await prisma.user.findFirst({
    where: { email: currentEmail, role: "ADMIN" },
    select: { id: true },
  });

  if (!existingAdmin) {
    throw new Error("No admin account found for ADMIN_CURRENT_EMAIL.");
  }

  if (email === currentEmail) {
    console.log("Admin email is already set to the requested address.");
    return;
  }

  const conflictingUser = await prisma.user.findUnique({ where: { email } });
  if (conflictingUser) {
    throw new Error("ADMIN_EMAIL is already used by another account.");
  }

  const admin = await prisma.user.update({
    where: { id: existingAdmin.id },
    data: { email },
    select: { email: true },
  });

  console.log(`Admin email updated: ${admin.email}`);
};

createAdmin()
  .catch((error) => {
    console.error("Error creating admin:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });