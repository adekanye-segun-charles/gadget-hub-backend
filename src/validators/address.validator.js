const Joi = require("joi");

const createAddressSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100).required(),

  phone: Joi.string().trim().min(7).max(20).required(),

  address: Joi.string().trim().min(5).max(300).required(),

  city: Joi.string().trim().min(2).max(100).required(),

  state: Joi.string().trim().min(2).max(100).required(),

  country: Joi.string().trim().min(2).max(100).default("Nigeria"),

  isDefault: Joi.boolean().default(false),
});

const updateAddressSchema = Joi.object({
  fullName: Joi.string().trim().min(2).max(100),

  phone: Joi.string().trim().min(7).max(20),

  address: Joi.string().trim().min(5).max(300),

  city: Joi.string().trim().min(2).max(100),

  state: Joi.string().trim().min(2).max(100),

  country: Joi.string().trim().min(2).max(100),

  isDefault: Joi.boolean(),
}).min(1);

module.exports = {
  createAddressSchema,
  updateAddressSchema,
};