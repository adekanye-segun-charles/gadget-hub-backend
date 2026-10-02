const express = require("express");

const couponController = require("../controllers/coupon.controller");

const protect = require("../middleware/auth.middleware");

const validate = require("../middleware/validate.middleware");

const {
  validateCustomerCouponSchema,
} = require("../validators/coupon.validator");

const router = express.Router();

// =====================================================
// CUSTOMER COUPON
// =====================================================



router.post(
  "/validate",
  protect,
  validate(validateCustomerCouponSchema),
  couponController.validateCoupon
);

module.exports = router;