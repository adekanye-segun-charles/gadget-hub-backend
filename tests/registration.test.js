const assert = require("node:assert/strict");
const test = require("node:test");
const prisma = require("../src/config/database");
const authService = require("../src/services/auth.service");

test("registration reports an existing email as a conflict", async (t) => {
  const originalFindUnique = prisma.user.findUnique;
  const originalCreate = prisma.user.create;
  let createCalled = false;

  prisma.user.findUnique = async () => ({ id: "existing-user" });
  prisma.user.create = async () => { createCalled = true; };
  t.after(() => {
    prisma.user.findUnique = originalFindUnique;
    prisma.user.create = originalCreate;
  });

  await assert.rejects(
    authService.registerUser({
      firstName: "Test",
      lastName: "User",
      email: "existing@example.com",
      password: "Valid-password-123",
    }),
    { statusCode: 409, message: "Email already registered" }
  );
  assert.equal(createCalled, false);
});

test("registration maps a concurrent duplicate email insert to a conflict", async (t) => {
  const originalFindUnique = prisma.user.findUnique;
  const originalCreate = prisma.user.create;

  prisma.user.findUnique = async () => null;
  prisma.user.create = async () => {
    const error = new Error("Unique constraint failed");
    error.code = "P2002";
    error.meta = { target: ["email"] };
    throw error;
  };
  t.after(() => {
    prisma.user.findUnique = originalFindUnique;
    prisma.user.create = originalCreate;
  });

  await assert.rejects(
    authService.registerUser({
      firstName: "Test",
      lastName: "User",
      email: "existing@example.com",
      password: "Valid-password-123",
    }),
    { statusCode: 409, message: "Email already registered" }
  );
});
