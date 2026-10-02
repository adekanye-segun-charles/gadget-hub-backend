const couponService = require("../services/coupon.service");

const validateCoupon = async (req, res, next) => {
  try {
    const { code, orderAmount } = req.body;

    const result = await couponService.validateCoupon(
      code,
      orderAmount
    );

    res.status(200).json({
      success: true,
      message: "Coupon applied successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  validateCoupon,
};