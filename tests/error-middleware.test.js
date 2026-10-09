const assert = require("node:assert/strict");
const test = require("node:test");
const errorHandler = require("../src/middleware/error.middleware");

test("production exposes explicitly safe operational errors", (t) => {
  t.mock.method(console, "error", () => {});
  const originalEnvironment = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  t.after(() => {
    if (originalEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalEnvironment;
  });

  let status;
  let body;
  const response = {
    headersSent: false,
    status(code) {
      status = code;
      return this;
    },
    json(value) {
      body = value;
      return this;
    },
  };

  errorHandler(
    Object.assign(new Error("Paystack is not configured."), {
      statusCode: 503,
      isOperational: true,
    }),
    { method: "POST", originalUrl: "/api/payments/initialize" },
    response,
    () => {}
  );

  assert.equal(status, 503);
  assert.equal(body.message, "Paystack is not configured.");
});

test("production continues to mask unexpected server errors", (t) => {
  t.mock.method(console, "error", () => {});
  const originalEnvironment = process.env.NODE_ENV;
  process.env.NODE_ENV = "production";
  t.after(() => {
    if (originalEnvironment === undefined) delete process.env.NODE_ENV;
    else process.env.NODE_ENV = originalEnvironment;
  });

  let body;
  const response = {
    headersSent: false,
    status() {
      return this;
    },
    json(value) {
      body = value;
      return this;
    },
  };

  errorHandler(
    Object.assign(new Error("internal diagnostic"), { statusCode: 500 }),
    { method: "POST", originalUrl: "/api/payments/initialize" },
    response,
    () => {}
  );

  assert.equal(body.message, "Something went wrong on the server. Please try again later.");
});
