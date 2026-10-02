const express = require("express");

const orderController = require("../controllers/order.controller");

const protect = require("../middleware/auth.middleware");

const validate = require("../middleware/validate.middleware");

const {
  createOrderSchema,
} = require("../validators/order.validator");

const router = express.Router();

// Create order
router.post(
  "/",
  protect,
  validate(createOrderSchema),
  orderController.createOrder
);

// Get user's orders
router.get(
  "/",
  protect,
  orderController.getOrders
);

// Get single order
router.get(
  "/:orderId",
  protect,
  orderController.getOrderById
);

// Cancel order
router.patch(
  "/:orderId/cancel",
  protect,
  orderController.cancelOrder
);

module.exports = router;