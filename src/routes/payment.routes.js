const express = require("express");

const paymentController = require("../controllers/payment.controller");
const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const {
  initializePaymentSchema,
} = require("../validators/payment.validator");

const router = express.Router();

router.post(
  "/initialize",
  protect,
  validate(initializePaymentSchema),
  paymentController.initializePayment
);

router.get(
  "/verify/:reference",
  protect,
  paymentController.verifyPayment
);

module.exports = router;