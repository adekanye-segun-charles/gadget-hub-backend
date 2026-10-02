const prisma = require("../config/database");

const createReview = async (userId, data) => {
  const { productId, rating, comment } = data;

  // Check that the product exists and is active
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Check whether the user has already reviewed this product
  const existingReview = await prisma.review.findUnique({
    where: {
      userId_productId: {
        userId,
        productId,
      },
    },
  });

  if (existingReview) {
    throw new Error("You have already reviewed this product");
  }

  // A review requires a successful purchase
  const purchasedProduct = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: {
        userId,
        paymentStatus: "SUCCESS",
        status: {
          not: "CANCELLED",
        },
      },
    },
  });

  if (!purchasedProduct) {
    throw new Error(
      "You can only review products you have purchased"
    );
  }

  return prisma.review.create({
    data: {
      userId,
      productId,
      rating,
      comment: comment || null,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
};

const getProductReviews = async (productId) => {
  const product = await prisma.product.findFirst({
    where: {
      id: productId,
      isActive: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  const reviews = await prisma.review.findMany({
    where: {
      productId,
      isApproved: true,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const summary = await prisma.review.aggregate({
    where: {
      productId,
      isApproved: true,
    },
    _avg: {
      rating: true,
    },
    _count: {
      id: true,
    },
  });

  return {
    reviews,
    summary: {
      averageRating: summary._avg.rating
        ? Number(summary._avg.rating.toFixed(1))
        : 0,
      totalReviews: summary._count.id,
    },
  };
};

const getReviewById = async (reviewId) => {
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  return review;
};

const updateReview = async (userId, reviewId, data) => {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId,
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  return prisma.review.update({
    where: {
      id: reviewId,
    },
    data,
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
};

const deleteReview = async (userId, reviewId) => {
  const review = await prisma.review.findFirst({
    where: {
      id: reviewId,
      userId,
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  await prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  return {
    message: "Review deleted successfully",
  };
};

const updateReviewApproval = async (reviewId, isApproved) => {
  const review = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!review) {
    throw new Error("Review not found");
  }

  return prisma.review.update({
    where: {
      id: reviewId,
    },
    data: {
      isApproved,
    },
    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      product: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
  });
};

module.exports = {
  createReview,
  getProductReviews,
  getReviewById,
  updateReview,
  deleteReview,
  updateReviewApproval,
};