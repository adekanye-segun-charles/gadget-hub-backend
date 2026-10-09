const nodemailer = require("nodemailer");

let transporter;

const getTransporter = () => {
  const { SMTP_HOST, SMTP_PORT, SMTP_SECURE, SMTP_USER, SMTP_PASS } = process.env;
  const port = Number(SMTP_PORT);

  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS || !Number.isInteger(port) || port < 1 || port > 65535) {
    const error = new Error("Password reset email is not configured. Add SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, and EMAIL_FROM to the backend environment.");
    error.statusCode = 503;
    throw error;
  }

  if (!transporter) {
    transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port,
      secure: SMTP_SECURE === "true",
      auth: {
        user: SMTP_USER,
        pass: SMTP_PASS,
      },
    });
  }

  return transporter;
};

const assertConfigured = () => {
  const sender = process.env.EMAIL_FROM || process.env.SMTP_USER;
  if (!sender) {
    return false;
  }

  try {
    getTransporter();
    return true;
  } catch {
    return false;
  }
};

const sendPasswordResetEmail = async (email, resetUrl) => {
  const sender = process.env.EMAIL_FROM || process.env.SMTP_USER;
  await getTransporter().sendMail({
    from: sender,
    to: email,
    subject: "Reset your Gadget Hub password",
    text: `We received a request to reset your Gadget Hub password. Open this link to choose a new password. The link expires in one hour:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
    html: `<div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#111827"><h1 style="color:#07111f">Reset your password</h1><p>We received a request to reset your Gadget Hub password.</p><p><a href="${resetUrl}" style="display:inline-block;padding:12px 20px;border-radius:8px;background:#ff6a00;color:#fff;text-decoration:none;font-weight:bold">Reset password</a></p><p>This link expires in one hour. If you did not request a reset, you can ignore this email.</p></div>`,
  });
};

module.exports = {
  assertConfigured,
  sendPasswordResetEmail,
};
