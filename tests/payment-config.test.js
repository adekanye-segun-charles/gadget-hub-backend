const assert = require("node:assert/strict");
const test = require("node:test");
const paystack = require("../src/config/paystack");

test("Paystack client rejects missing or malformed secret keys before making a request", async (t) => {
  const originalKey = process.env.PAYSTACK_SECRET_KEY;
  t.after(() => {
    if (originalKey === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = originalKey;
  });

  for (const key of [undefined, "", "undefined", "your_paystack_secret_key"]) {
    if (key === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = key;

    await assert.rejects(
      paystack.get("/transaction/verify/test-reference"),
      {
        statusCode: 503,
        isOperational: true,
        message: "Paystack is not configured. Set a valid PAYSTACK_SECRET_KEY in the backend environment.",
      }
    );
  }
});
