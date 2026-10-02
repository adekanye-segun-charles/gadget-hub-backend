const Joi = require("joi");

// CREATE CATEGORY
const createCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),

  description: Joi.string()
    .trim()
    .max(500)
    .allow("", null)
    .optional(),

  image: Joi.string()
    .uri()
    .allow("", null)
    .optional(),
});

// UPDATE CATEGORY
const updateCategorySchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100),

  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),

  description: Joi.string()
    .trim()
    .max(500)
    .allow("", null),

  image: Joi.string()
    .uri()
    .allow("", null),
}).min(1);

// UPDATE CATEGORY STATUS
const updateCategoryStatusSchema = Joi.object({
  isActive: Joi.boolean().required(),
});

module.exports = {
  createCategorySchema,
  updateCategorySchema,
  updateCategoryStatusSchema,

  // Admin aliases
  createAdminCategorySchema: createCategorySchema,
  updateAdminCategorySchema: updateCategorySchema,
  updateAdminCategoryStatusSchema: updateCategoryStatusSchema,
};