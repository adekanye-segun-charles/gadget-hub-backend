const Joi = require("joi");

const addToWishlistSchema = Joi.object({
  productId: Joi.string().uuid().required(),
});

module.exports = {
  addToWishlistSchema,
};