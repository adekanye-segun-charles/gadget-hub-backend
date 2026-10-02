const prisma = require("../config/database");

const addToWishlist = async (userId, productId) => {
  // Check if product exists
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Check if product is active
  if (!product.isActive) {
    throw new Error("Product is not available");
  }

  // Find or create user's wishlist
  let wishlist = await prisma.wishlist.findUnique({
    where: {
      userId,
    },
  });

  if (!wishlist) {
    wishlist = await prisma.wishlist.create({
      data: {
        userId,
      },
    });
  }

  // Check if product is already in wishlist
  const existingItem = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId,
      },
    },
  });

  if (existingItem) {
    throw new Error("Product is already in your wishlist");
  }

  // Add product to wishlist
  return prisma.wishlistItem.create({
    data: {
      wishlistId: wishlist.id,
      productId,
    },
    include: {
      product: {
        include: {
          images: true,
          category: true,
        },
      },
    },
  });
};

const getWishlist = async (userId) => {
  const wishlist = await prisma.wishlist.findUnique({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
              category: true,
            },
          },
        },
      },
    },
  });

  if (!wishlist) {
    return {
      id: null,
      items: [],
    };
  }

  return wishlist;
};

const removeFromWishlist = async (userId, wishlistItemId) => {
  // Find user's wishlist
  const wishlist = await prisma.wishlist.findUnique({
    where: {
      userId,
    },
  });

  if (!wishlist) {
    throw new Error("Wishlist not found");
  }

  // Check that the item belongs to this user's wishlist
  const wishlistItem = await prisma.wishlistItem.findFirst({
    where: {
      id: wishlistItemId,
      wishlistId: wishlist.id,
    },
  });

  if (!wishlistItem) {
    throw new Error("Wishlist item not found");
  }

  // Remove item
  await prisma.wishlistItem.delete({
    where: {
      id: wishlistItemId,
    },
  });

  return {
    message: "Product removed from wishlist successfully",
  };
};

module.exports = {
  addToWishlist,
  getWishlist,
  removeFromWishlist,
};