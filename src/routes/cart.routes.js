const express = require("express");

const cartController = require("../controllers/cart.controller");
const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const {
  addToCartSchema,
  updateCartItemSchema,
} = require("../validators/cart.validator");

const router = express.Router();

// Add product to cart
router.post(
  "/",
  protect,
  validate(addToCartSchema),
  cartController.addToCart
);

// Get user's cart
router.get(
  "/",
  protect,
  cartController.getCart
);

// Update cart item quantity
router.put(
  "/:cartItemId",
  protect,
  validate(updateCartItemSchema),
  cartController.updateCartItem
);

// Remove cart item
router.delete(
  "/:cartItemId",
  protect,
  cartController.removeCartItem
);

module.exports = router;