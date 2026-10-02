const reviewService = require("../services/review.service");

const createReview = async (req, res, next) => {
  try {
    const review = await reviewService.createReview(
      req.user.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

const getProductReviews = async (req, res, next) => {
  try {
    const result = await reviewService.getProductReviews(
      req.params.productId
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const getReviewById = async (req, res, next) => {
  try {
    const review = await reviewService.getReviewById(
      req.params.reviewId
    );

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    next(error);
  }
};

const updateReview = async (req, res, next) => {
  try {
    const review = await reviewService.updateReview(
      req.user.userId,
      req.params.reviewId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

const deleteReview = async (req, res, next) => {
  try {
    const result = await reviewService.deleteReview(
      req.user.userId,
      req.params.reviewId
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
};

const updateReviewApproval = async (req, res, next) => {
  try {
    const review = await reviewService.updateReviewApproval(
      req.params.reviewId,
      req.body.isApproved
    );

    res.status(200).json({
      success: true,
      message: "Review approval updated successfully",
      review,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createReview,
  getProductReviews,
  getReviewById,
  updateReview,
  deleteReview,
  updateReviewApproval,
};