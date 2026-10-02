const Joi = require("joi");

const createCouponSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .min(3)
    .max(50)
    .pattern(/^[A-Z0-9_-]+$/)
    .required(),

  description: Joi.string()
    .trim()
    .max(500)
    .allow("", null)
    .optional(),

  discountType: Joi.string()
    .valid("PERCENTAGE", "FIXED")
    .required(),

  discountValue: Joi.number()
    .positive()
    .required(),

  minimumAmount: Joi.number()
    .min(0)
    .default(0),

  maximumUses: Joi.number()
    .integer()
    .min(1)
    .allow(null)
    .optional(),

  expiresAt: Joi.date()
    .iso()
    .allow(null)
    .optional(),

  isActive: Joi.boolean()
    .default(true),
});


const updateCouponSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .min(3)
    .max(50)
    .pattern(/^[A-Z0-9_-]+$/),

  description: Joi.string()
    .trim()
    .max(500)
    .allow("", null),

  discountType: Joi.string()
    .valid("PERCENTAGE", "FIXED"),

  discountValue: Joi.number()
    .positive(),

  minimumAmount: Joi.number()
    .min(0),

  maximumUses: Joi.number()
    .integer()
    .min(1)
    .allow(null),

  expiresAt: Joi.date()
    .iso()
    .allow(null),

  isActive: Joi.boolean(),
}).min(1);


const updateCouponStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});


const adminCouponQuerySchema = Joi.object({
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

  discountType: Joi.string()
    .valid("PERCENTAGE", "FIXED")
    .optional(),

  isActive: Joi.boolean()
    .optional(),

  sortOrder: Joi.string()
    .valid("asc", "desc")
    .default("desc"),
});


const validateCustomerCouponSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .required(),

  orderAmount: Joi.number()
    .positive()
    .required(),
});

module.exports = {
  createCouponSchema,
  updateCouponSchema,
  updateCouponStatusSchema,
  adminCouponQuerySchema,

  createAdminCouponSchema: createCouponSchema,
  updateAdminCouponSchema: updateCouponSchema,
  updateAdminCouponStatusSchema: updateCouponStatusSchema,

  validateCustomerCouponSchema,
};