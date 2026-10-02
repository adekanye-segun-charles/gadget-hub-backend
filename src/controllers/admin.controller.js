const adminService = require("../services/admin.service");

// ==========================================
// DASHBOARD
// ==========================================

const getDashboardStats = async (req, res, next) => {
  try {
    const stats = await adminService.getDashboardStats();

    res.status(200).json({
      success: true,
      message: "Admin dashboard statistics retrieved successfully",
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};


// ==========================================
// USER MANAGEMENT
// ==========================================

// Get all users
const getUsers = async (req, res, next) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const search = String(
      req.query.search || ""
    ).trim();

    const result = await adminService.getUsers({
      page,
      limit,
      search,
    });

    res.status(200).json({
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


// Get user by ID
const getUserById = async (req, res, next) => {
  try {
    const user = await adminService.getUserById(
      req.params.userId
    );

    res.status(200).json({
      success: true,
      message: "User retrieved successfully",
      data: user,
    });
  } catch (error) {
    next(error);
  }
};


// Activate / deactivate user
const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    const user = await adminService.updateUserStatus(
      req.params.userId,
      isActive
    );

    res.status(200).json({
      success: true,
      message: `User ${
        user.isActive
          ? "activated"
          : "deactivated"
      } successfully`,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};


// Delete user
const deleteUser = async (req, res, next) => {
  try {
    const result = await adminService.deleteUser(
      req.params.userId
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};


// ==========================================
// PRODUCT MANAGEMENT
// ==========================================

// Create product
const createAdminProduct = async (req, res, next) => {
  try {
    const product =
      await adminService.createAdminProduct(
        req.body
      );

    res.status(201).json({
      success: true,
      message: "Product created successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};


// Get all products
const getAdminProducts = async (req, res, next) => {
  try {
    const page = Math.max(
      Number(req.query.page) || 1,
      1
    );

    const limit = Math.min(
      Math.max(Number(req.query.limit) || 10, 1),
      100
    );

    const search = String(
      req.query.search || ""
    ).trim();

    const categoryId = String(
      req.query.categoryId || ""
    ).trim();

    const result =
      await adminService.getAdminProducts({
        page,
        limit,
        search,
        categoryId,
      });

    res.status(200).json({
      success: true,
      message: "Products retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


// Get product by ID
const getAdminProductById = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await adminService.getAdminProductById(
        req.params.productId
      );

    res.status(200).json({
      success: true,
      message: "Product retrieved successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};


// Update product
const updateAdminProduct = async (
  req,
  res,
  next
) => {
  try {
    const product =
      await adminService.updateAdminProduct(
        req.params.productId,
        req.body
      );

    res.status(200).json({
      success: true,
      message: "Product updated successfully",
      data: product,
    });
  } catch (error) {
    next(error);
  }
};


// Activate / deactivate product
const updateAdminProductStatus = async (
  req,
  res,
  next
) => {
  try {
    const { isActive } = req.body;

    if (typeof isActive !== "boolean") {
      return res.status(400).json({
        success: false,
        message: "isActive must be a boolean",
      });
    }

    const product =
      await adminService.updateAdminProductStatus(
        req.params.productId,
        isActive
      );

    res.status(200).json({
      success: true,
      message: `Product ${
        product.isActive
          ? "activated"
          : "deactivated"
      } successfully`,
      data: product,
    });
  } catch (error) {
    next(error);
  }
};


// Delete product
const deleteAdminProduct = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await adminService.deleteAdminProduct(
        req.params.productId
      );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};


// =====================================================
// ADMIN CATEGORY CONTROLLERS
// =====================================================

const createAdminCategory = async (req, res, next) => {
  try {
    const category = await adminService.createAdminCategory(req.body);

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};


const getAdminCategories = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;
    const search = req.query.search?.trim() || "";

    const result = await adminService.getAdminCategories({
      page,
      limit,
      search,
    });

    res.status(200).json({
      success: true,
      message: "Categories retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


const getAdminCategoryById = async (req, res, next) => {
  try {
    const category = await adminService.getAdminCategoryById(
      req.params.categoryId
    );

    res.status(200).json({
      success: true,
      message: "Category retrieved successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};


const updateAdminCategory = async (req, res, next) => {
  try {
    const category = await adminService.updateAdminCategory(
      req.params.categoryId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Category updated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};


const updateAdminCategoryStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const category = await adminService.updateAdminCategoryStatus(
      req.params.categoryId,
      isActive
    );

    res.status(200).json({
      success: true,
      message: isActive
        ? "Category activated successfully"
        : "Category deactivated successfully",
      data: category,
    });
  } catch (error) {
    next(error);
  }
};


const deleteAdminCategory = async (req, res, next) => {
  try {
    await adminService.deleteAdminCategory(
      req.params.categoryId
    );

    res.status(200).json({
      success: true,
      message: "Category deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};

// =====================================================
// ADMIN ORDER CONTROLLERS
// =====================================================

const getAdminOrders = async (req, res, next) => {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 10;

    const search = req.query.search?.trim() || "";

    const status = req.query.status || undefined;

    const paymentStatus =
      req.query.paymentStatus || undefined;

    const userId = req.query.userId || undefined;

    const sortOrder =
      req.query.sortOrder === "asc"
        ? "asc"
        : "desc";

    const result = await adminService.getAdminOrders({
      page,
      limit,
      search,
      status,
      paymentStatus,
      userId,
      sortOrder,
    });

    res.status(200).json({
      success: true,
      message: "Orders retrieved successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};


const getAdminOrderById = async (req, res, next) => {
  try {
    const order = await adminService.getAdminOrderById(
      req.params.orderId
    );

    res.status(200).json({
      success: true,
      message: "Order retrieved successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};


const updateAdminOrderStatus = async (req, res, next) => {
  try {
    const { status } = req.body;

    const order = await adminService.updateAdminOrderStatus(
      req.params.orderId,
      status
    );

    res.status(200).json({
      success: true,
      message: "Order status updated successfully",
      data: order,
    });
  } catch (error) {
    next(error);
  }
};


const getAdminPayments = async (req, res) => {
  const {
    page,
    limit,
    search,
    status,
    gateway,
    orderId,
    sortOrder,
  } = req.query;

  const result = await adminService.getAdminPayments({
    page,
    limit,
    search,
    status,
    gateway,
    orderId,
    sortOrder,
  });

  return res.status(200).json({
    success: true,
    message: "Payments retrieved successfully",
    data: result,
  });
};


const getAdminPaymentById = async (req, res) => {
  const { paymentId } = req.params;

  const payment = await adminService.getAdminPaymentById(paymentId);

  return res.status(200).json({
    success: true,
    message: "Payment retrieved successfully",
    data: payment,
  });
};


const getAdminPaymentStats = async (req, res) => {
  const stats = await adminService.getAdminPaymentStats();

  return res.status(200).json({
    success: true,
    message: "Payment statistics retrieved successfully",
    data: stats,
  });
};


const createAdminCoupon = async (req, res) => {
  const coupon = await adminService.createAdminCoupon(req.body);

  return res.status(201).json({
    success: true,
    message: "Coupon created successfully",
    data: coupon,
  });
};


const getAdminCoupons = async (req, res) => {
  const {
    page,
    limit,
    search,
    discountType,
    isActive,
    sortOrder,
  } = req.query;

  const result = await adminService.getAdminCoupons({
    page,
    limit,
    search,
    discountType,
    isActive,
    sortOrder,
  });

  return res.status(200).json({
    success: true,
    message: "Coupons retrieved successfully",
    data: result,
  });
};


const getAdminCouponById = async (req, res) => {
  const { couponId } = req.params;

  const coupon = await adminService.getAdminCouponById(
    couponId
  );

  return res.status(200).json({
    success: true,
    message: "Coupon retrieved successfully",
    data: coupon,
  });
};


const updateAdminCoupon = async (req, res) => {
  const { couponId } = req.params;

  const coupon = await adminService.updateAdminCoupon(
    couponId,
    req.body
  );

  return res.status(200).json({
    success: true,
    message: "Coupon updated successfully",
    data: coupon,
  });
};


const updateAdminCouponStatus = async (req, res) => {
  const { couponId } = req.params;

  const coupon =
    await adminService.updateAdminCouponStatus(
      couponId,
      req.body.isActive
    );

  return res.status(200).json({
    success: true,
    message: "Coupon status updated successfully",
    data: coupon,
  });
};


const deleteAdminCoupon = async (req, res) => {
  const { couponId } = req.params;

  const result = await adminService.deleteAdminCoupon(
    couponId
  );

  return res.status(200).json({
    success: true,
    message: "Coupon deleted successfully",
    data: result,
  });
};


const getAdminReviews = async (req, res) => {
  const {
    page,
    limit,
    search,
    productId,
    userId,
    rating,
    isApproved,
    sortOrder,
  } = req.query;

  const result = await adminService.getAdminReviews({
    page,
    limit,
    search,
    productId,
    userId,
    rating,
    isApproved,
    sortOrder,
  });

  return res.status(200).json({
    success: true,
    message: "Reviews retrieved successfully",
    data: result,
  });
};


const getAdminReviewById = async (req, res) => {
  const { reviewId } = req.params;

  const review = await adminService.getAdminReviewById(
    reviewId
  );

  return res.status(200).json({
    success: true,
    message: "Review retrieved successfully",
    data: review,
  });
};


const updateAdminReviewApproval = async (req, res) => {
  const { reviewId } = req.params;

  const review =
    await adminService.updateAdminReviewApproval(
      reviewId,
      req.body.isApproved
    );

  return res.status(200).json({
    success: true,
    message: req.body.isApproved
      ? "Review approved successfully"
      : "Review rejected successfully",
    data: review,
  });
};


const deleteAdminReview = async (req, res) => {
  const { reviewId } = req.params;

  const result = await adminService.deleteAdminReview(
    reviewId
  );

  return res.status(200).json({
    success: true,
    message: "Review deleted successfully",
    data: result,
  });
};

module.exports = {
  getDashboardStats,

  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,

  createAdminProduct,
  getAdminProducts,
  getAdminProductById,
  updateAdminProduct,
  updateAdminProductStatus,
  deleteAdminProduct,

  createAdminCategory,
  getAdminCategories,
  getAdminCategoryById,
  updateAdminCategory,
  updateAdminCategoryStatus,
  deleteAdminCategory,

  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,

  getAdminPayments,
  getAdminPaymentById,
  getAdminPaymentStats,

  createAdminCoupon,
  getAdminCoupons,
  getAdminCouponById,
  updateAdminCoupon,
  updateAdminCouponStatus,
  deleteAdminCoupon,


  getAdminReviews,
  getAdminReviewById,
  updateAdminReviewApproval,
  deleteAdminReview,
};