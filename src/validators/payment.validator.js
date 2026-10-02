const Joi = require("joi");

const initializePaymentSchema = Joi.object({
  orderId: Joi.string().uuid().required(),
});

const verifyPaymentSchema = Joi.object({
  reference: Joi.string().trim().min(3).max(200).required(),
});

const adminPaymentQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),

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
    .valid("PENDING", "SUCCESS", "FAILED", "REFUNDED")
    .optional(),

  gateway: Joi.string()
    .valid("PAYSTACK")
    .optional(),

  orderId: Joi.string()
    .uuid()
    .optional(),

  sortOrder: Joi.string()
    .valid("asc", "desc")
    .default("desc"),
});

module.exports = {
  initializePaymentSchema,
  verifyPaymentSchema,
  adminPaymentQuerySchema,
};