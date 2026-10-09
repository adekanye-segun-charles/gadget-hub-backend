const Joi = require("joi");

const updateProfileSchema = Joi.object({
  firstName: Joi.string().trim().min(2).max(50),
  lastName: Joi.string().trim().min(2).max(50),
  phone: Joi.string().trim().min(7).max(20).allow("", null),
}).min(1);

module.exports = {
  updateProfileSchema,
};