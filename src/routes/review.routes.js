const express = require("express");

const reviewController = require("../controllers/review.controller");
const protect = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createReviewSchema,
  updateReviewSchema,
} = require("../validators/review.validator");

const router = express.Router();

// Public
router.get(
  "/product/:productId",
  reviewController.getProductReviews
);

router.get(
  "/:reviewId",
  reviewController.getReviewById
);

// Customer
router.post(
  "/",
  protect,
  validate(createReviewSchema),
  reviewController.createReview
);

router.put(
  "/:reviewId",
  protect,
  validate(updateReviewSchema),
  reviewController.updateReview
);

router.delete(
  "/:reviewId",
  protect,
  reviewController.deleteReview
);

// Admin
router.patch(
  "/:reviewId/approval",
  protect,
  adminOnly,
  reviewController.updateReviewApproval
);

module.exports = router;