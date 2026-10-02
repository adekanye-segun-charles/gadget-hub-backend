const Joi = require("joi");

// =====================================================
// CREATE ORDER
// =====================================================

const createOrderSchema = Joi.object({
  addressId: Joi.string().uuid().required(),

  couponCode: Joi.string()
    .trim()
    .uppercase()
    .allow("", null)
    .optional(),

  shippingFee: Joi.number()
    .min(0)
    .default(0),
});


// =====================================================
// UPDATE ORDER STATUS - ADMIN
// =====================================================

const updateAdminOrderStatusSchema = Joi.object({
  status: Joi.string()
    .valid(
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED"
    )
    .required(),
});


// =====================================================
// ADMIN ORDER QUERY
// =====================================================

const adminOrderQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(10),

  search: Joi.string()
    .trim()
    .max(100)
    .allow("")
    .default(""),

  status: Joi.string()
    .valid(
      "PENDING",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED"
    )
    .optional(),

  paymentStatus: Joi.string()
    .valid(
      "PENDING",
      "SUCCESS",
      "FAILED",
      "REFUNDED"
    )
    .optional(),

  userId: Joi.string()
    .uuid()
    .optional(),

  sortOrder: Joi.string()
    .valid("asc", "desc")
    .default("desc"),
});


module.exports = {
  createOrderSchema,
  updateAdminOrderStatusSchema,
  adminOrderQuerySchema,

  // Admin alias
  updateOrderStatusSchema: updateAdminOrderStatusSchema,
};