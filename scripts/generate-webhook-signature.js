require("dotenv").config();

const crypto = require("crypto");

const body = JSON.stringify({
  event: "charge.success",
  data: {
    reference: "GH-PAY-1789750190952-1938",
    amount: 80000000,
    status: "success",
    paid_at: "2026-09-18T15:09:26.000Z",
  },
});

const signature = crypto
  .createHmac("sha512", process.env.PAYSTACK_SECRET_KEY)
  .update(body)
  .digest("hex");

console.log(signature);