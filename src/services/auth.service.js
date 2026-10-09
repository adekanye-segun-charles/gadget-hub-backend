const bcrypt = require("bcrypt");
const crypto = require("crypto");
const prisma = require("../config/database");
const emailService = require("./email.service");

const registerUser = async ({
  firstName,
  lastName,
  email,
  password,
  phone,
}) => {
  const existingUser = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (existingUser) {
    const error = new Error("Email already registered");
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  let user;
  try {
    user = await prisma.user.create({
      data: {
        firstName,
        lastName,
        email,
        password: hashedPassword,
        phone,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });
  } catch (error) {
    if (error.code === "P2002" && error.meta?.target?.includes("email")) {
      const conflict = new Error("Email already registered");
      conflict.statusCode = 409;
      throw conflict;
    }
    throw error;
  }

  return user;
};

const loginUser = async ({ email, password }) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  if (!user) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  if (!user.isActive) {
    const error = new Error("Your account is inactive");
    error.statusCode = 403;
    throw error;
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    const error = new Error("Invalid email or password");
    error.statusCode = 401;
    throw error;
  }

  return {
    id: user.id,
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    phone: user.phone,
    role: user.role,
    isActive: user.isActive,
    createdAt: user.createdAt,
  };
};

const requestPasswordReset = async (email) => {
  const frontendUrl = process.env.FRONTEND_URL
    || process.env.CORS_ORIGINS?.split(",").map((origin) => origin.trim()).find(Boolean)
    || "https://gadget-hub-frontend-ashen.vercel.app";

  let resetUrl;
  try {
    resetUrl = new URL("/pages/auth/reset-password.html", frontendUrl);
    if (!["http:", "https:"].includes(resetUrl.protocol)) throw new Error("Unsupported frontend URL protocol");
  } catch {
    const error = new Error("Password reset email is not configured. Set FRONTEND_URL to a valid HTTP(S) URL.");
    error.statusCode = 503;
    throw error;
  }

  let isEmailConfigured = true;
  try {
    isEmailConfigured = emailService.assertConfigured() !== false;
  } catch {
    isEmailConfigured = false;
  }

  if (!isEmailConfigured) {
    const error = new Error("Password reset email is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM to the backend environment.");
    error.statusCode = 503;
    throw error;
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, isActive: true },
  });
  if (!user || !user.isActive) return;

  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordResetToken: tokenHash,
      passwordResetExpires: expiresAt,
    },
  });

  resetUrl.searchParams.set("token", token);

  try {
    await emailService.sendPasswordResetEmail(email, resetUrl.toString());
  } catch (error) {
    await prisma.user.updateMany({
      where: { id: user.id, passwordResetToken: tokenHash },
      data: { passwordResetToken: null, passwordResetExpires: null },
    });
    throw error;
  }
};

const resetPassword = async (token, newPassword) => {
  const tokenHash = crypto.createHash("sha256").update(token).digest("hex");
  const now = new Date();
  const user = await prisma.user.findUnique({
    where: { passwordResetToken: tokenHash },
    select: { id: true, isActive: true, passwordResetExpires: true },
  });

  if (!user || !user.isActive || !user.passwordResetExpires || user.passwordResetExpires <= now) {
    const error = new Error("This password reset link is invalid or has expired. Request a new one.");
    error.statusCode = 400;
    throw error;
  }

  const hashedPassword = await bcrypt.hash(newPassword, 12);
  const result = await prisma.user.updateMany({
    where: {
      id: user.id,
      isActive: true,
      passwordResetToken: tokenHash,
      passwordResetExpires: { gt: now },
    },
    data: {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    },
  });

  if (result.count !== 1) {
    const error = new Error("This password reset link is invalid or has expired. Request a new one.");
    error.statusCode = 400;
    throw error;
  }
};

module.exports = {
  registerUser,
  loginUser,
  requestPasswordReset,
  resetPassword,
};