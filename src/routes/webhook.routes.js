const express = require("express");

const webhookController = require("../controllers/webhook.controller");

const router = express.Router();

router.post(
  "/paystack",
  webhookController.handlePaystackWebhook
);

module.exports = router;