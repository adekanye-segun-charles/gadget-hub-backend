const wishlistService = require("../services/wishlist.service");

const addToWishlist = async (req, res, next) => {
  try {
    const { productId } = req.body;

    const wishlistItem = await wishlistService.addToWishlist(
      req.user.userId,
      productId
    );

    res.status(201).json({
      success: true,
      message: "Product added to wishlist successfully",
      data: wishlistItem,
    });
  } catch (error) {
    next(error);
  }
};

const getWishlist = async (req, res, next) => {
  try {
    const wishlist = await wishlistService.getWishlist(req.user.userId);

    res.status(200).json({
      success: true,
      message: "Wishlist retrieved successfully",
      data: wishlist,
    });
  } catch (error) {
    next(error);
  }
};

const removeFromWishlist = async (req, res, next) => {
  try {
    const { wishlistItemId } = req.params;

    const result = await wishlistService.removeFromWishlist(
      req.user.userId,
      wishlistItemId
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
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};