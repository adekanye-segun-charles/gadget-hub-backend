const axios = require("axios");

const paystack = axios.create({
  baseURL: process.env.PAYSTACK_BASE_URL || "https://api.paystack.co",
  headers: {
    "Content-Type": "application/json",
  },
});

paystack.interceptors.request.use((config) => {
  const secretKey = process.env.PAYSTACK_SECRET_KEY?.trim();
  if (!secretKey || !/^sk_(test|live)_.+/.test(secretKey)) {
    const error = new Error("Paystack is not configured. Set a valid PAYSTACK_SECRET_KEY in the backend environment.");
    error.statusCode = 503;
    throw error;
  }

  config.headers.Authorization = `Bearer ${secretKey}`;
  return config;
});

module.exports = paystack;
