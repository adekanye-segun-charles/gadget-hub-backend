const express = require("express");

const wishlistController = require("../controllers/wishlist.controller");
const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const {
  addToWishlistSchema,
} = require("../validators/wishlist.validator");

const router = express.Router();

// Add product to wishlist
router.post(
  "/",
  protect,
  validate(addToWishlistSchema),
  wishlistController.addToWishlist
);

// Get wishlist
router.get(
  "/",
  protect,
  wishlistController.getWishlist
);

// Remove product from wishlist
router.delete(
  "/:wishlistItemId",
  protect,
  wishlistController.removeFromWishlist
);

module.exports = router;