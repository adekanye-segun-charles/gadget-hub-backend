const prisma = require("../config/database");

const addToCart = async (userId, productId, quantity) => {
  // Check if the product exists
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  // Check if the product is active
  if (!product.isActive) {
    throw new Error("Product is not available");
  }

  // Check stock
  if (product.stock < quantity) {
    throw new Error("Not enough stock available");
  }

  // Find the user's cart
  let cart = await prisma.cart.findUnique({
    where: { userId },
  });

  // Create a cart if the user doesn't have one
  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId,
      },
    });
  }

  // Check if product is already in the cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  if (existingItem) {
    const newQuantity = existingItem.quantity + quantity;

    if (product.stock < newQuantity) {
      throw new Error("Not enough stock available");
    }

    return prisma.cartItem.update({
      where: {
        id: existingItem.id,
      },
      data: {
        quantity: newQuantity,
      },
      include: {
        product: true,
      },
    });
  }

  // Add new product to cart
  return prisma.cartItem.create({
    data: {
      cartId: cart.id,
      productId,
      quantity,
    },
    include: {
      product: true,
    },
  });
};


const getCart = async (userId) => {
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: {
            include: {
              images: true,
            },
          },
        },
      },
    },
  });

  if (!cart) {
    return {
      id: null,
      items: [],
      total: 0,
    };
  }

  const total = cart.items.reduce((sum, item) => {
    return sum + Number(item.product.price) * item.quantity;
  }, 0);

  return {
    id: cart.id,
    items: cart.items,
    total,
  };
};

const updateCartItem = async (userId, cartItemId, quantity) => {
  // Find the user's cart
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  // Find the cart item
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cartId: cart.id,
    },
    include: {
      product: true,
    },
  });

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  // Check stock
  if (cartItem.product.stock < quantity) {
    throw new Error("Not enough stock available");
  }

  // Update quantity
  return prisma.cartItem.update({
    where: {
      id: cartItemId,
    },
    data: {
      quantity,
    },
    include: {
      product: true,
    },
  });
};

const removeCartItem = async (userId, cartItemId) => {
  // Find the user's cart
  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
  });

  if (!cart) {
    throw new Error("Cart not found");
  }

  // Find the cart item
  const cartItem = await prisma.cartItem.findFirst({
    where: {
      id: cartItemId,
      cartId: cart.id,
    },
  });

  if (!cartItem) {
    throw new Error("Cart item not found");
  }

  // Remove the item
  await prisma.cartItem.delete({
    where: {
      id: cartItemId,
    },
  });

  return {
    message: "Cart item removed successfully",
  };
};

module.exports = {
  addToCart,
  getCart,
  updateCartItem,
  removeCartItem,
};