const express = require("express");

const adminController = require("../controllers/admin.controller");

const protect = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");
const validate = require("../middleware/validate.middleware");

// Product validators
const {
  createAdminProductSchema,
  updateAdminProductSchema,
  updateAdminProductStatusSchema,
} = require("../validators/product.validator");

// Category validators
const {
  createAdminCategorySchema,
  updateAdminCategorySchema,
  updateAdminCategoryStatusSchema,
} = require("../validators/category.validator");

// Order validators
const {
  updateAdminOrderStatusSchema,
} = require("../validators/order.validator");

const router = express.Router();


// Coupon validators
const {
  createAdminCouponSchema,
  updateAdminCouponSchema,
  updateAdminCouponStatusSchema,
} = require("../validators/coupon.validator");

// Review validators
const {
  updateAdminReviewApprovalSchema,
} = require("../validators/review.validator");

// =====================================================
// ADMIN DASHBOARD
// =====================================================

router.get(
  "/dashboard",
  protect,
  adminOnly,
  adminController.getDashboardStats
);


// =====================================================
// ADMIN USER MANAGEMENT
// =====================================================

router.get(
  "/users",
  protect,
  adminOnly,
  adminController.getUsers
);

router.get(
  "/users/:userId",
  protect,
  adminOnly,
  adminController.getUserById
);

router.patch(
  "/users/:userId/status",
  protect,
  adminOnly,
  adminController.updateUserStatus
);

router.delete(
  "/users/:userId",
  protect,
  adminOnly,
  adminController.deleteUser
);


// =====================================================
// ADMIN PRODUCT MANAGEMENT
// =====================================================

router.post(
  "/products",
  protect,
  adminOnly,
  validate(createAdminProductSchema),
  adminController.createAdminProduct
);

router.get(
  "/products",
  protect,
  adminOnly,
  adminController.getAdminProducts
);

router.get(
  "/products/:productId",
  protect,
  adminOnly,
  adminController.getAdminProductById
);

router.put(
  "/products/:productId",
  protect,
  adminOnly,
  validate(updateAdminProductSchema),
  adminController.updateAdminProduct
);

router.patch(
  "/products/:productId/status",
  protect,
  adminOnly,
  validate(updateAdminProductStatusSchema),
  adminController.updateAdminProductStatus
);

router.delete(
  "/products/:productId",
  protect,
  adminOnly,
  adminController.deleteAdminProduct
);


// =====================================================
// ADMIN CATEGORY MANAGEMENT
// =====================================================

router.post(
  "/categories",
  protect,
  adminOnly,
  validate(createAdminCategorySchema),
  adminController.createAdminCategory
);

router.get(
  "/categories",
  protect,
  adminOnly,
  adminController.getAdminCategories
);

router.get(
  "/categories/:categoryId",
  protect,
  adminOnly,
  adminController.getAdminCategoryById
);

router.put(
  "/categories/:categoryId",
  protect,
  adminOnly,
  validate(updateAdminCategorySchema),
  adminController.updateAdminCategory
);

router.patch(
  "/categories/:categoryId/status",
  protect,
  adminOnly,
  validate(updateAdminCategoryStatusSchema),
  adminController.updateAdminCategoryStatus
);

router.delete(
  "/categories/:categoryId",
  protect,
  adminOnly,
  adminController.deleteAdminCategory
);


// =====================================================
// ADMIN ORDER MANAGEMENT
// =====================================================

// Get all orders
router.get(
  "/orders",
  protect,
  adminOnly,
  adminController.getAdminOrders
);

// Get single order
router.get(
  "/orders/:orderId",
  protect,
  adminOnly,
  adminController.getAdminOrderById
);

// Update order status
router.patch(
  "/orders/:orderId/status",
  protect,
  adminOnly,
  validate(updateAdminOrderStatusSchema),
  adminController.updateAdminOrderStatus
);


// =====================================================
// ADMIN PAYMENT MANAGEMENT
// =====================================================

// Get payment statistics
router.get(
  "/payments/stats",
  protect,
  adminOnly,
  adminController.getAdminPaymentStats
);

// Get all payments
router.get(
  "/payments",
  protect,
  adminOnly,
  adminController.getAdminPayments
);

// Get single payment
router.get(
  "/payments/:paymentId",
  protect,
  adminOnly,
  adminController.getAdminPaymentById
);


// =====================================================
// ADMIN COUPON MANAGEMENT
// =====================================================

// Create coupon
router.post(
  "/coupons",
  protect,
  adminOnly,
  validate(createAdminCouponSchema),
  adminController.createAdminCoupon
);

// Get all coupons
router.get(
  "/coupons",
  protect,
  adminOnly,
  adminController.getAdminCoupons
);

// Get single coupon
router.get(
  "/coupons/:couponId",
  protect,
  adminOnly,
  adminController.getAdminCouponById
);

// Update coupon
router.put(
  "/coupons/:couponId",
  protect,
  adminOnly,
  validate(updateAdminCouponSchema),
  adminController.updateAdminCoupon
);

// Activate/deactivate coupon
router.patch(
  "/coupons/:couponId/status",
  protect,
  adminOnly,
  validate(updateAdminCouponStatusSchema),
  adminController.updateAdminCouponStatus
);

// Delete coupon
router.delete(
  "/coupons/:couponId",
  protect,
  adminOnly,
  adminController.deleteAdminCoupon
);

// Review Management

router.get(
  "/reviews",
  protect,
  adminOnly,
  adminController.getAdminReviews
);

router.get(
  "/reviews/:reviewId",
  protect,
  adminOnly,
  adminController.getAdminReviewById
);

router.patch(
  "/reviews/:reviewId/approval",
  protect,
  adminOnly,
  validate(updateAdminReviewApprovalSchema),
  adminController.updateAdminReviewApproval
);

router.delete(
  "/reviews/:reviewId",
  protect,
  adminOnly,
  adminController.deleteAdminReview
);

module.exports = router;