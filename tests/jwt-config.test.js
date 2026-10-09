const assert = require("node:assert/strict");
const test = require("node:test");
const { generateToken, getJwtSecret } = require("../src/utils/jwt");

test("JWT configuration rejects missing and placeholder secrets clearly", (t) => {
  const originalSecret = process.env.JWT_SECRET;
  t.after(() => {
    if (originalSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = originalSecret;
  });

  for (const secret of [undefined, "", "replace_with_a_strong_secret"]) {
    if (secret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = secret;

    assert.throws(getJwtSecret, {
      statusCode: 503,
      isOperational: true,
      message: "Authentication is unavailable because JWT_SECRET is not configured on the backend.",
    });
    assert.throws(() => generateToken({ id: "user-id", role: "CUSTOMER" }), {
      statusCode: 503,
      isOperational: true,
    });
  }
});
