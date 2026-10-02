const paymentService = require("../services/payment.service");

const initializePayment = async (req, res, next) => {
  try {
    const { orderId } = req.body;

    const result = await paymentService.initializePayment(
      req.user.userId,
      orderId
    );

    res.status(200).json({
      success: true,
      message: "Payment initialized successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { reference } = req.params;

    const result = await paymentService.verifyPayment(
      req.user.userId,
      reference
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  initializePayment,
  verifyPayment,
};