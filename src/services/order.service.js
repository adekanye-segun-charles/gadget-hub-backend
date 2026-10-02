const prisma = require("../config/database");
const { generateOrderNumber } = require("../utils/generateOrderNumber");
const { validateCoupon } = require("./coupon.service");

const createOrder = async (userId, data) => {
  const { addressId, couponCode } = data;

  // ==========================================
  // CHECK ADDRESS
  // ==========================================

  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    const error = new Error("Address not found");
    error.statusCode = 404;
    throw error;
  }

  // ==========================================
  // GET CART
  // ==========================================

  const cart = await prisma.cart.findUnique({
    where: {
      userId,
    },
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
  });

  if (!cart || cart.items.length === 0) {
    throw new Error("Your cart is empty");
  }

  // ==========================================
  // CALCULATE SUBTOTAL
  // ==========================================

  let subtotal = 0;

  for (const item of cart.items) {
    if (!item.product.isActive) {
      throw new Error(
        `Product "${item.product.name}" is no longer available`
      );
    }

    if (item.product.stock < item.quantity) {
      throw new Error(
        `Not enough stock available for "${item.product.name}"`
      );
    }

    subtotal += Number(item.product.price) * item.quantity;
  }

  // ==========================================
  // COUPON
  // ==========================================

  let discountAmount = 0;
  let appliedCouponCode = null;

  if (couponCode) {
    const couponResult = await validateCoupon(
      couponCode,
      subtotal
    );

    discountAmount = couponResult.discountAmount;
    appliedCouponCode = couponResult.code;
  }

  // ==========================================
  // TOTAL
  // ==========================================

  const shippingFee = 0;

  const totalAmount =
    subtotal - discountAmount + shippingFee;

  // ==========================================
  // CREATE ORDER
  // ==========================================

  const order = await prisma.$transaction(async (tx) => {
    const newOrder = await tx.order.create({
      data: {
        orderNumber: generateOrderNumber(),

        userId,
        addressId,

        subtotal,
        discountAmount,
        shippingFee,
        totalAmount,

        status: "PENDING",
        paymentStatus: "PENDING",

        couponCode: appliedCouponCode,

        shippingFullName: address.fullName,
        shippingPhone: address.phone,
        shippingAddress: address.address,
        shippingCity: address.city,
        shippingState: address.state,
        shippingCountry: address.country,

        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            productName: item.product.name,
            sku: item.product.sku,
            price: item.product.price,
            quantity: item.quantity,
            subtotal:
              Number(item.product.price) * item.quantity,
          })),
        },
      },

      include: {
        items: true,
        address: true,
      },
    });

    // ==========================================
    // UPDATE PRODUCT STOCK
    // ==========================================

    for (const item of cart.items) {
      await tx.product.update({
        where: {
          id: item.productId,
        },
        data: {
          stock: {
            decrement: item.quantity,
          },
        },
      });
    }

    // ==========================================
    // UPDATE COUPON USAGE
    // ==========================================

    if (appliedCouponCode) {
      await tx.coupon.update({
        where: {
          code: appliedCouponCode,
        },
        data: {
          usedCount: {
            increment: 1,
          },
        },
      });
    }

    // ==========================================
    // CLEAR CART
    // ==========================================

    await tx.cartItem.deleteMany({
      where: {
        cartId: cart.id,
      },
    });

    return newOrder;
  });

  return order;
};

// ==========================================
// GET ALL USER ORDERS
// ==========================================

const getOrders = async (userId) => {
  return prisma.order.findMany({
    where: {
      userId,
    },

    include: {
      items: true,
      address: true,

      payments: {
        select: {
          id: true,
          reference: true,
          amount: true,
          status: true,
          gateway: true,
          paidAt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

// ==========================================
// GET SINGLE ORDER
// ==========================================

const getOrderById = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
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

      address: true,

      payments: {
        select: {
          id: true,
          reference: true,
          amount: true,
          status: true,
          gateway: true,
          paidAt: true,
          createdAt: true,
          updatedAt: true,
        },
      },
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  return order;
};

// ==========================================
// CANCEL ORDER
// ==========================================

const cancelOrder = async (userId, orderId) => {
  const order = await prisma.order.findFirst({
    where: {
      id: orderId,
      userId,
    },

    include: {
      items: true,
    },
  });

  if (!order) {
    throw new Error("Order not found");
  }

  if (order.status !== "PENDING") {
    throw new Error(
      "Only pending orders can be cancelled"
    );
  }

  const cancelledOrder = await prisma.$transaction(
    async (tx) => {
      const updatedOrder = await tx.order.update({
        where: {
          id: orderId,
        },

        data: {
          status: "CANCELLED",
        },

        include: {
          items: true,
        },
      });

      // Return stock
      for (const item of order.items) {
        await tx.product.update({
          where: {
            id: item.productId,
          },

          data: {
            stock: {
              increment: item.quantity,
            },
          },
        });
      }

      return updatedOrder;
    }
  );

  return cancelledOrder;
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  cancelOrder,
};