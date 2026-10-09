const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const test = require("node:test");
const bcrypt = require("bcrypt");

const prisma = require("../src/config/database");
const authService = require("../src/services/auth.service");
const emailService = require("../src/services/email.service");

test("password reset request emails a raw token but stores only its hash", async (t) => {
  const userDelegate = prisma.user;
  const originalFindUnique = userDelegate.findUnique;
  const originalUpdate = userDelegate.update;
  const originalAssertConfigured = emailService.assertConfigured;
  const originalSendEmail = emailService.sendPasswordResetEmail;
  const originalFrontendUrl = process.env.FRONTEND_URL;
  let savedData;
  let sentEmail;
  let sentUrl;

  userDelegate.findUnique = async () => ({ id: "user-id", isActive: true });
  userDelegate.update = async ({ data }) => { savedData = data; };
  emailService.assertConfigured = () => {};
  emailService.sendPasswordResetEmail = async (email, url) => {
    sentEmail = email;
    sentUrl = url;
  };
  process.env.FRONTEND_URL = "https://store.example";
  t.after(() => {
    userDelegate.findUnique = originalFindUnique;
    userDelegate.update = originalUpdate;
    emailService.assertConfigured = originalAssertConfigured;
    emailService.sendPasswordResetEmail = originalSendEmail;
    if (originalFrontendUrl === undefined) delete process.env.FRONTEND_URL;
    else process.env.FRONTEND_URL = originalFrontendUrl;
  });

  await authService.requestPasswordReset("customer@example.com");

  const token = new URL(sentUrl).searchParams.get("token");
  assert.equal(sentEmail, "customer@example.com");
  assert.match(token, /^[a-f\d]{64}$/i);
  assert.equal(
    savedData.passwordResetToken,
    crypto.createHash("sha256").update(token).digest("hex")
  );
  assert.notEqual(savedData.passwordResetToken, token);
  assert.ok(savedData.passwordResetExpires > new Date());
  assert.ok(savedData.passwordResetExpires <= new Date(Date.now() + 60 * 60 * 1000));
});

test("password reset consumes its token and stores a bcrypt hash", async (t) => {
  const userDelegate = prisma.user;
  const originalFindUnique = userDelegate.findUnique;
  const originalUpdateMany = userDelegate.updateMany;
  const token = crypto.randomBytes(32).toString("hex");
  let updateOptions;

  userDelegate.findUnique = async () => ({
    id: "user-id",
    isActive: true,
    passwordResetExpires: new Date(Date.now() + 60_000),
  });
  userDelegate.updateMany = async (options) => {
    updateOptions = options;
    return { count: 1 };
  };
  t.after(() => {
    userDelegate.findUnique = originalFindUnique;
    userDelegate.updateMany = originalUpdateMany;
  });

  await authService.resetPassword(token, "A-new-password-123");

  assert.equal(updateOptions.data.passwordResetToken, null);
  assert.equal(updateOptions.data.passwordResetExpires, null);
  assert.equal(await bcrypt.compare("A-new-password-123", updateOptions.data.password), true);
});

test("password reset rejects expired tokens without changing the password", async (t) => {
  const userDelegate = prisma.user;
  const originalFindUnique = userDelegate.findUnique;
  const originalUpdateMany = userDelegate.updateMany;
  let updateCalled = false;

  userDelegate.findUnique = async () => ({
    id: "user-id",
    isActive: true,
    passwordResetExpires: new Date(Date.now() - 1000),
  });
  userDelegate.updateMany = async () => { updateCalled = true; };
  t.after(() => {
    userDelegate.findUnique = originalFindUnique;
    userDelegate.updateMany = originalUpdateMany;
  });

  await assert.rejects(
    authService.resetPassword(crypto.randomBytes(32).toString("hex"), "A-new-password-123"),
    { statusCode: 400, message: "This password reset link is invalid or has expired. Request a new one." }
  );
  assert.equal(updateCalled, false);
});
