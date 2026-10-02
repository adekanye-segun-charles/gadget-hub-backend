const cartService = require("../services/cart.service");

const addToCart = async (req, res, next) => {
  try {
    const { productId, quantity } = req.body;

    const cartItem = await cartService.addToCart(
      req.user.userId,
      productId,
      quantity
    );

    res.status(201).json({
      success: true,
      message: "Product added to cart successfully",
      data: cartItem,
    });
  } catch (error) {
    next(error);
  }
};

const getCart = async (req, res, next) => {
  try {
    const cart = await cartService.getCart(req.user.userId);

    res.status(200).json({
      success: true,
      message: "Cart retrieved successfully",
      data: cart,
    });
  } catch (error) {
    next(error);
  }
};

const updateCartItem = async (req, res, next) => {
  try {
    const { cartItemId } = req.params;
    const { quantity } = req.body;

    const cartItem = await cartService.updateCartItem(
      req.user.userId,
      cartItemId,
      quantity
    );

    res.status(200).json({
      success: true,
      message: "Cart item updated successfully",
      data: cartItem,
    });
  } catch (error) {
    next(error);
  }
};

const removeCartItem = async (req, res, next) => {
  try {
    const { cartItemId } = req.params;

    const result = await cartService.removeCartItem(
      req.user.userId,
      cartItemId
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
};