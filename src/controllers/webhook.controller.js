const webhookService = require("../services/webhook.service");

const handlePaystackWebhook = async (req, res) => {
  try {
    const result = await webhookService.processPaystackWebhook(
      req.rawBody,
      req.headers["x-paystack-signature"],
      req.body
    );

    return res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    console.error("Paystack webhook error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Webhook processing failed",
    });
  }
};

module.exports = {
  handlePaystackWebhook,
};