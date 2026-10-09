const axios = require("axios");

const paystack = axios.create({
  baseURL: process.env.PAYSTACK_BASE_URL || "https://api.paystack.co",
  headers: {
    "Content-Type": "application/json",
  },
});

paystack.interceptors.request.use((config) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  let message;
  if (!secretKey) {
    message = "Paystack is not configured. Set PAYSTACK_SECRET_KEY to your Paystack secret key (sk_test_... or sk_live_...) in the backend environment.";
  } else if (/^pk_(test|live)_/.test(secretKey)) {
    message = "PAYSTACK_SECRET_KEY contains a Paystack public key. Backend payments require a secret key (sk_test_... or sk_live_...), not a public key (pk_...).";
  } else if (!/^sk_(test|live)_.+/.test(secretKey)) {
    message = "PAYSTACK_SECRET_KEY is invalid. Use a Paystack secret key beginning with sk_test_ or sk_live_.";
  }

  if (message) {
    const error = new Error(message);
    error.statusCode = 503;
    error.isOperational = true;
    throw error;
  }

  config.headers.Authorization = `Bearer ${secretKey}`;
  return config;
});

module.exports = paystack;
