const Joi = require("joi");

// ==========================================
// CREATE PRODUCT
// ==========================================

const createProductSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(200)
    .required(),

  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
    .required(),

  description: Joi.string()
    .trim()
    .min(10)
    .required(),

  price: Joi.number()
    .positive()
    .required(),

  comparePrice: Joi.number()
    .positive()
    .allow(null)
    .optional(),

  stock: Joi.number()
    .integer()
    .min(0)
    .required(),

  sku: Joi.string()
    .trim()
    .uppercase()
    .min(2)
    .max(100)
    .required(),

  brand: Joi.string()
    .trim()
    .max(100)
    .allow("", null)
    .optional(),

  specifications: Joi.object()
    .allow(null)
    .optional(),

  categoryId: Joi.string()
    .uuid()
    .required(),

  isFeatured: Joi.boolean()
    .default(false),
});


// ==========================================
// UPDATE PRODUCT
// ==========================================

const updateProductSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(200),

  slug: Joi.string()
    .trim()
    .lowercase()
    .pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),

  description: Joi.string()
    .trim()
    .min(10),

  price: Joi.number()
    .positive(),

  comparePrice: Joi.number()
    .positive()
    .allow(null),

  stock: Joi.number()
    .integer()
    .min(0),

  sku: Joi.string()
    .trim()
    .uppercase()
    .min(2)
    .max(100),

  brand: Joi.string()
    .trim()
    .max(100)
    .allow("", null),

  specifications: Joi.object()
    .allow(null),

  categoryId: Joi.string()
    .uuid(),

  isFeatured: Joi.boolean(),
}).min(1);


// ==========================================
// UPDATE PRODUCT STATUS
// ==========================================

const updateProductStatusSchema = Joi.object({
  isActive: Joi.boolean()
    .required(),
});


// ==========================================
// PRODUCT QUERY
// ==========================================

const productQuerySchema = Joi.object({
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

  categoryId: Joi.string()
    .uuid()
    .optional(),

  brand: Joi.string()
    .trim()
    .max(100)
    .optional(),

  minPrice: Joi.number()
    .min(0)
    .optional(),

  maxPrice: Joi.number()
    .min(0)
    .optional(),

  isFeatured: Joi.boolean()
    .optional(),

  sortBy: Joi.string()
    .valid(
      "createdAt",
      "price",
      "name",
      "stock"
    )
    .default("createdAt"),

  sortOrder: Joi.string()
    .valid("asc", "desc")
    .default("desc"),
});


// ==========================================
// EXPORTS
// ==========================================

module.exports = {
  createProductSchema,
  updateProductSchema,
  updateProductStatusSchema,
  productQuerySchema,

  // Admin routes use these names
  createAdminProductSchema: createProductSchema,
  updateAdminProductSchema: updateProductSchema,
  updateAdminProductStatusSchema: updateProductStatusSchema,
};