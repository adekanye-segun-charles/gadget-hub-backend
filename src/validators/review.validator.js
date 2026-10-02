const Joi = require("joi");

const createReviewSchema = Joi.object({
  productId: Joi.string().uuid().required(),

  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .required(),

  comment: Joi.string()
    .trim()
    .max(1000)
    .allow("", null),
});

const updateReviewSchema = Joi.object({
  rating: Joi.number()
    .integer()
    .min(1)
    .max(5),

  comment: Joi.string()
    .trim()
    .max(1000)
    .allow("", null),
}).min(1);


const adminReviewQuerySchema = Joi.object({
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

  productId: Joi.string()
    .uuid()
    .optional(),

  userId: Joi.string()
    .uuid()
    .optional(),

  rating: Joi.number()
    .integer()
    .min(1)
    .max(5)
    .optional(),

  isApproved: Joi.boolean()
    .optional(),

  sortOrder: Joi.string()
    .valid("asc", "desc")
    .default("desc"),
});

const updateAdminReviewApprovalSchema = Joi.object({
  isApproved: Joi.boolean().required(),
});

module.exports = {
  createReviewSchema,
  updateReviewSchema,
  adminReviewQuerySchema,
  updateAdminReviewApprovalSchema,
};