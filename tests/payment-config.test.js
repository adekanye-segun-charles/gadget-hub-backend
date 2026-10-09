const assert = require("node:assert/strict");
const test = require("node:test");
const paystack = require("../src/config/paystack");

test("Paystack client rejects missing, public, or malformed secret keys before making a request", async (t) => {
  const originalKey = process.env.PAYSTACK_SECRET_KEY;
  t.after(() => {
    if (originalKey === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = originalKey;
  });

  const invalidKeys = [
    {
      key: undefined,
      message: "Paystack is not configured. Set PAYSTACK_SECRET_KEY to your Paystack secret key (sk_test_... or sk_live_...) in the backend environment.",
    },
    {
      key: "",
      message: "Paystack is not configured. Set PAYSTACK_SECRET_KEY to your Paystack secret key (sk_test_... or sk_live_...) in the backend environment.",
    },
    {
      key: "pk_test_example",
      message: "PAYSTACK_SECRET_KEY contains a Paystack public key. Backend payments require a secret key (sk_test_... or sk_live_...), not a public key (pk_...).",
    },
    {
      key: "undefined",
      message: "PAYSTACK_SECRET_KEY is invalid. Use a Paystack secret key beginning with sk_test_ or sk_live_.",
    },
    {
      key: "your_paystack_secret_key",
      message: "PAYSTACK_SECRET_KEY is invalid. Use a Paystack secret key beginning with sk_test_ or sk_live_.",
    },
  ];

  for (const { key, message } of invalidKeys) {
    if (key === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = key;

    await assert.rejects(
      paystack.get("/transaction/verify/test-reference"),
      {
        statusCode: 503,
        isOperational: true,
        message,
      }
    );
  }
});

test("Paystack client sends a configured test secret key as a bearer token", async (t) => {
  const originalKey = process.env.PAYSTACK_SECRET_KEY;
  t.after(() => {
    if (originalKey === undefined) delete process.env.PAYSTACK_SECRET_KEY;
    else process.env.PAYSTACK_SECRET_KEY = originalKey;
  });

  const secretKey = "sk_test_unit_test_key";
  process.env.PAYSTACK_SECRET_KEY = secretKey;

  const response = await paystack.get("/transaction/verify/test-reference", {
    adapter: async (config) => ({
      data: { status: true },
      status: 200,
      statusText: "OK",
      headers: {},
      config,
    }),
  });

  assert.equal(response.status, 200);
  assert.equal(response.config.headers.get("Authorization"), `Bearer ${secretKey}`);
});
