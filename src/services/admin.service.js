const prisma = require("../config/database");

const getDashboardStats = async () => {
  const [
    totalUsers,
    activeUsers,
    customerUsers,
    adminUsers,

    totalProducts,
    activeProducts,
    lowStockProducts,

    totalCategories,

    totalOrders,
    pendingOrders,
    processingOrders,
    shippedOrders,
    deliveredOrders,
    cancelledOrders,

    totalPayments,
    pendingPayments,
    successfulPaymentsCount,
    failedPayments,
    refundedPayments,

    successfulPaymentAmount,

    pendingReviews,
    totalReviews,

    recentOrders,
    recentUsers,
  ] = await Promise.all([
    // USERS
    prisma.user.count(),

    prisma.user.count({
      where: {
        isActive: true,
      },
    }),

    prisma.user.count({
      where: {
        role: "CUSTOMER",
      },
    }),

    prisma.user.count({
      where: {
        role: "ADMIN",
      },
    }),

    // PRODUCTS
    prisma.product.count(),

    prisma.product.count({
      where: {
        isActive: true,
      },
    }),

    prisma.product.count({
      where: {
        stock: {
          lte: 5,
        },
        isActive: true,
      },
    }),

    // CATEGORIES
    prisma.category.count(),

    // ORDERS
    prisma.order.count(),

    prisma.order.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.order.count({
      where: {
        status: "PROCESSING",
      },
    }),

    prisma.order.count({
      where: {
        status: "SHIPPED",
      },
    }),

    prisma.order.count({
      where: {
        status: "DELIVERED",
      },
    }),

    prisma.order.count({
      where: {
        status: "CANCELLED",
      },
    }),

    // PAYMENTS
    prisma.payment.count(),

    prisma.payment.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.payment.count({
      where: {
        status: "SUCCESS",
      },
    }),

    prisma.payment.count({
      where: {
        status: "FAILED",
      },
    }),

    prisma.payment.count({
      where: {
        status: "REFUNDED",
      },
    }),

    prisma.payment.aggregate({
      where: {
        status: "SUCCESS",
      },
      _sum: {
        amount: true,
      },
    }),

    // REVIEWS
    prisma.review.count({
      where: {
        isApproved: false,
      },
    }),

    prisma.review.count(),

    // RECENT ORDERS
    prisma.order.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentStatus: true,
        totalAmount: true,
        createdAt: true,

        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    }),

    // RECENT USERS
    prisma.user.findMany({
      take: 5,
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    }),
  ]);

  return {
    users: {
      total: totalUsers,
      active: activeUsers,
      inactive: totalUsers - activeUsers,
      customers: customerUsers,
      admins: adminUsers,
    },

    products: {
      total: totalProducts,
      active: activeProducts,
      inactive: totalProducts - activeProducts,
      lowStock: lowStockProducts,
    },

    categories: {
      total: totalCategories,
    },

    orders: {
      total: totalOrders,
      pending: pendingOrders,
      processing: processingOrders,
      shipped: shippedOrders,
      delivered: deliveredOrders,
      cancelled: cancelledOrders,
    },

    payments: {
      total: totalPayments,
      pending: pendingPayments,
      successful: successfulPaymentsCount,
      failed: failedPayments,
      refunded: refundedPayments,
    },

    revenue: {
      total: successfulPaymentAmount._sum.amount
        ? Number(successfulPaymentAmount._sum.amount)
        : 0,
      currency: "NGN",
    },

    reviews: {
      total: totalReviews,
      pendingApproval: pendingReviews,
      approved: totalReviews - pendingReviews,
    },

    recentOrders,

    recentUsers,
  };
};


const getUsers = async ({ page = 1, limit = 10, search = "" }) => {
  const skip = (page - 1) * limit;

  const where = search
    ? {
        OR: [
          {
            firstName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            lastName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            phone: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }
    : {};

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        _count: {
          select: {
            orders: true,
            reviews: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    users,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,

      addresses: true,

      _count: {
        select: {
          orders: true,
          reviews: true,
          addresses: true,
        },
      },
    },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};

const updateUserStatus = async (userId, isActive) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role === "ADMIN") {
    const error = new Error("Admin account status cannot be changed here");
    error.statusCode = 403;
    throw error;
  }

  return prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      isActive,
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      phone: true,
      role: true,
      isActive: true,
      updatedAt: true,
    },
  });
};

const deleteUser = async (userId) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  if (user.role === "ADMIN") {
    const error = new Error("Admin account cannot be deleted here");
    error.statusCode = 403;
    throw error;
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  return {
    message: "User deleted successfully",
  };
};

const createAdminProduct = async (data) => {
  const {
    name,
    slug,
    description,
    price,
    comparePrice,
    stock,
    sku,
    brand,
    specifications,
    categoryId,
    isFeatured,
  } = data;

  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  const existingSlug = await prisma.product.findUnique({
    where: {
      slug,
    },
  });

  if (existingSlug) {
    const error = new Error("Product slug already exists");
    error.statusCode = 409;
    throw error;
  }

  const existingSku = await prisma.product.findUnique({
    where: {
      sku,
    },
  });

  if (existingSku) {
    const error = new Error("Product SKU already exists");
    error.statusCode = 409;
    throw error;
  }

  return prisma.product.create({
    data: {
      name,
      slug,
      description,
      price,
      comparePrice: comparePrice ?? null,
      stock,
      sku,
      brand: brand ?? null,
      specifications: specifications ?? null,
      categoryId,
      isFeatured: isFeatured ?? false,
    },
    include: {
      category: true,
      images: true,
    },
  });
};

// Get all products for admin
const getAdminProducts = async ({
  page = 1,
  limit = 10,
  search = "",
  categoryId = "",
}) => {
  const skip = (page - 1) * limit;

  const where = {};

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        sku: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        brand: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  if (categoryId) {
    where.categoryId = categoryId;
  }

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip,
      take: limit,
      include: {
        category: true,
        images: true,
        _count: {
          select: {
            reviews: true,
            orderItems: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),

    prisma.product.count({
      where,
    }),
  ]);

  return {
    products,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


// Get one product by ID
const getAdminProductById = async (productId) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: true,
      images: true,
      reviews: {
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
      },
      _count: {
        select: {
          reviews: true,
          orderItems: true,
          cartItems: true,
          wishlistItems: true,
        },
      },
    },
  });

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  return product;
};


// Update product
const updateAdminProduct = async (productId, data) => {
  const existingProduct = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!existingProduct) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: {
        id: data.categoryId,
      },
    });

    if (!category) {
      const error = new Error("Category not found");
      error.statusCode = 404;
      throw error;
    }
  }

  if (data.slug && data.slug !== existingProduct.slug) {
    const slugExists = await prisma.product.findFirst({
      where: {
        slug: data.slug,
        id: {
          not: productId,
        },
      },
    });

    if (slugExists) {
      const error = new Error("Product slug already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  if (data.sku && data.sku !== existingProduct.sku) {
    const skuExists = await prisma.product.findFirst({
      where: {
        sku: data.sku,
        id: {
          not: productId,
        },
      },
    });

    if (skuExists) {
      const error = new Error("Product SKU already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  return prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      ...(data.name !== undefined && {
        name: data.name,
      }),

      ...(data.slug !== undefined && {
        slug: data.slug,
      }),

      ...(data.description !== undefined && {
        description: data.description,
      }),

      ...(data.price !== undefined && {
        price: data.price,
      }),

      ...(data.comparePrice !== undefined && {
        comparePrice: data.comparePrice,
      }),

      ...(data.stock !== undefined && {
        stock: data.stock,
      }),

      ...(data.sku !== undefined && {
        sku: data.sku,
      }),

      ...(data.brand !== undefined && {
        brand: data.brand,
      }),

      ...(data.specifications !== undefined && {
        specifications: data.specifications,
      }),

      ...(data.categoryId !== undefined && {
        categoryId: data.categoryId,
      }),

      ...(data.isFeatured !== undefined && {
        isFeatured: data.isFeatured,
      }),
    },

    include: {
      category: true,
      images: true,
    },
  });
};


// Activate / deactivate product
const updateAdminProductStatus = async (
  productId,
  isActive
) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.product.update({
    where: {
      id: productId,
    },
    data: {
      isActive,
    },
    include: {
      category: true,
      images: true,
    },
  });
};


// Delete product
const deleteAdminProduct = async (productId) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      _count: {
        select: {
          orderItems: true,
        },
      },
    },
  });

  if (!product) {
    const error = new Error("Product not found");
    error.statusCode = 404;
    throw error;
  }

  // Do not delete products that already belong to orders.
  if (product._count.orderItems > 0) {
    const error = new Error(
      "Product cannot be deleted because it has existing order history. Deactivate it instead."
    );

    error.statusCode = 409;
    throw error;
  }

  await prisma.product.delete({
    where: {
      id: productId,
    },
  });

  return {
    message: "Product deleted successfully",
  };
};


// =====================================================
// ADMIN CATEGORY MANAGEMENT
// =====================================================

const createAdminCategory = async (data) => {
  const {
    name,
    slug,
    description,
    image,
  } = data;

  const existingName = await prisma.category.findUnique({
    where: {
      name,
    },
  });

  if (existingName) {
    const error = new Error("Category name already exists");
    error.statusCode = 409;
    throw error;
  }

  const existingSlug = await prisma.category.findUnique({
    where: {
      slug,
    },
  });

  if (existingSlug) {
    const error = new Error("Category slug already exists");
    error.statusCode = 409;
    throw error;
  }

  return prisma.category.create({
    data: {
      name,
      slug,
      description: description ?? null,
      image: image ?? null,
    },
    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
};


const getAdminCategories = async ({
  page = 1,
  limit = 10,
  search = "",
}) => {
  const skip = (page - 1) * limit;

  const where = {};

  if (search) {
    where.OR = [
      {
        name: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        slug: {
          contains: search,
          mode: "insensitive",
        },
      },
    ];
  }

  const [categories, total] = await Promise.all([
    prisma.category.findMany({
      where,
      skip,
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        _count: {
          select: {
            products: true,
          },
        },
      },
    }),

    prisma.category.count({
      where,
    }),
  ]);

  return {
    categories,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


const getAdminCategoryById = async (categoryId) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },

    include: {
      products: {
        select: {
          id: true,
          name: true,
          slug: true,
          price: true,
          stock: true,
          sku: true,
          brand: true,
          isActive: true,
          isFeatured: true,
        },

        orderBy: {
          createdAt: "desc",
        },
      },

      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  return category;
};


const updateAdminCategory = async (categoryId, data) => {
  const existingCategory = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!existingCategory) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  const {
    name,
    slug,
    description,
    image,
  } = data;

  if (name && name !== existingCategory.name) {
    const existingName = await prisma.category.findUnique({
      where: {
        name,
      },
    });

    if (existingName) {
      const error = new Error("Category name already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  if (slug && slug !== existingCategory.slug) {
    const existingSlug = await prisma.category.findUnique({
      where: {
        slug,
      },
    });

    if (existingSlug) {
      const error = new Error("Category slug already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  return prisma.category.update({
    where: {
      id: categoryId,
    },

    data: {
      ...(name !== undefined && {
        name,
      }),

      ...(slug !== undefined && {
        slug,
      }),

      ...(description !== undefined && {
        description,
      }),

      ...(image !== undefined && {
        image,
      }),
    },

    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
};


const updateAdminCategoryStatus = async (categoryId, isActive) => {
  const existingCategory = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!existingCategory) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.category.update({
    where: {
      id: categoryId,
    },

    data: {
      isActive,
    },

    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });
};


const deleteAdminCategory = async (categoryId) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },

    include: {
      _count: {
        select: {
          products: true,
        },
      },
    },
  });

  if (!category) {
    const error = new Error("Category not found");
    error.statusCode = 404;
    throw error;
  }

  if (category._count.products > 0) {
    const error = new Error(
      "Cannot delete category because it contains products"
    );

    error.statusCode = 409;

    throw error;
  }

  await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });

  return true;
};


// =====================================================
// ADMIN ORDER MANAGEMENT
// =====================================================

const getAdminOrders = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  paymentStatus,
  userId,
  sortOrder = "desc",
}) => {
  const skip = (page - 1) * limit;

  const where = {};

  // -------------------------------
  // Search
  // -------------------------------

  if (search) {
    where.OR = [
      {
        orderNumber: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        shippingFullName: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        shippingPhone: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        user: {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  // -------------------------------
  // Filters
  // -------------------------------

  if (status) {
    where.status = status;
  }

  if (paymentStatus) {
    where.paymentStatus = paymentStatus;
  }

  if (userId) {
    where.userId = userId;
  }

  // -------------------------------
  // Get orders + total
  // -------------------------------

  const [orders, total] = await Promise.all([
    prisma.order.findMany({
      where,

      skip,
      take: limit,

      orderBy: {
        createdAt: sortOrder,
      },

      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },

        address: true,

        items: {
          select: {
            id: true,
            productId: true,
            productName: true,
            sku: true,
            price: true,
            quantity: true,
            subtotal: true,
          },
        },

        payments: {
          select: {
            id: true,
            reference: true,
            amount: true,
            status: true,
            gateway: true,
            paidAt: true,
            createdAt: true,
          },

          orderBy: {
            createdAt: "desc",
          },
        },

        _count: {
          select: {
            items: true,
            payments: true,
          },
        },
      },
    }),

    prisma.order.count({
      where,
    }),
  ]);

  return {
    orders,

    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


const getAdminOrderById = async (orderId) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },

    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          role: true,
          isActive: true,
        },
      },

      address: true,

      items: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
              sku: true,
              price: true,
              stock: true,
              isActive: true,
              images: {
                where: {
                  isPrimary: true,
                },

                take: 1,
              },
            },
          },
        },
      },

      payments: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  return order;
};


// =====================================================
// UPDATE ORDER STATUS
// =====================================================

const updateAdminOrderStatus = async (orderId, newStatus) => {
  const order = await prisma.order.findUnique({
    where: {
      id: orderId,
    },
  });

  if (!order) {
    const error = new Error("Order not found");
    error.statusCode = 404;
    throw error;
  }

  // No need to update if status is already the same.
  if (order.status === newStatus) {
    return order;
  }

  // -----------------------------------------
  // Prevent changes after cancellation
  // -----------------------------------------

  if (order.status === "CANCELLED") {
    const error = new Error(
      "A cancelled order cannot be changed"
    );

    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // Prevent changes after delivery
  // -----------------------------------------

  if (order.status === "DELIVERED") {
    const error = new Error(
      "A delivered order cannot be changed"
    );

    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // Allowed status flow
  // -----------------------------------------

  const allowedTransitions = {
    PENDING: [
      "PROCESSING",
      "CANCELLED",
    ],

    PROCESSING: [
      "SHIPPED",
      "CANCELLED",
    ],

    SHIPPED: [
      "DELIVERED",
    ],

    DELIVERED: [],

    CANCELLED: [],
  };

  const allowedNextStatuses =
    allowedTransitions[order.status];

  if (!allowedNextStatuses.includes(newStatus)) {
    const error = new Error(
      `Cannot change order status from ${order.status} to ${newStatus}`
    );

    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // Update order
  // -----------------------------------------

  return prisma.order.update({
    where: {
      id: orderId,
    },

    data: {
      status: newStatus,
    },

    include: {
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },

      items: true,

      payments: true,
    },
  });
};


const getAdminPayments = async ({
  page = 1,
  limit = 10,
  search = "",
  status,
  gateway,
  orderId,
  sortOrder = "desc",
}) => {
  const skip = (page - 1) * limit;

  const where = {
    ...(status && {
      status,
    }),

    ...(gateway && {
      gateway,
    }),

    ...(orderId && {
      orderId,
    }),

    ...(search && {
      OR: [
        {
          reference: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          order: {
            orderNumber: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ],
    }),
  };

  const [payments, total] = await Promise.all([
    prisma.payment.findMany({
      where,
      skip,
      take: limit,

      orderBy: {
        createdAt: sortOrder,
      },

      include: {
        order: {
          select: {
            id: true,
            orderNumber: true,
            totalAmount: true,
            status: true,
            paymentStatus: true,

            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        },
      },
    }),

    prisma.payment.count({
      where,
    }),
  ]);

  return {
    payments,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};


const getAdminPaymentById = async (paymentId) => {
  const payment = await prisma.payment.findUnique({
    where: {
      id: paymentId,
    },

    include: {
      order: {
        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },

          address: true,

          items: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                  sku: true,
                  price: true,
                },
              },
            },
          },

          payments: true,
        },
      },
    },
  });

  if (!payment) {
    const error = new Error("Payment not found");
    error.statusCode = 404;
    throw error;
  }

  return payment;
};


const getAdminPaymentStats = async () => {
  const [
    totalPayments,
    pendingPayments,
    successfulPayments,
    failedPayments,
    refundedPayments,
    successfulAmount,
  ] = await Promise.all([
    prisma.payment.count(),

    prisma.payment.count({
      where: {
        status: "PENDING",
      },
    }),

    prisma.payment.count({
      where: {
        status: "SUCCESS",
      },
    }),

    prisma.payment.count({
      where: {
        status: "FAILED",
      },
    }),

    prisma.payment.count({
      where: {
        status: "REFUNDED",
      },
    }),

    prisma.payment.aggregate({
      where: {
        status: "SUCCESS",
      },
      _sum: {
        amount: true,
      },
    }),
  ]);

  return {
    totalPayments,
    pendingPayments,
    successfulPayments,
    failedPayments,
    refundedPayments,
    successfulAmount: successfulAmount._sum.amount || 0,
  };
};



const createAdminCoupon = async (data) => {
  const {
    code,
    description,
    discountType,
    discountValue,
    minimumAmount,
    maximumUses,
    expiresAt,
    isActive,
  } = data;

  if (
    discountType === "PERCENTAGE" &&
    Number(discountValue) > 100
  ) {
    const error = new Error(
      "Percentage discount cannot be greater than 100"
    );
    error.statusCode = 400;
    throw error;
  }

  if (expiresAt && new Date(expiresAt) <= new Date()) {
    const error = new Error(
      "Coupon expiry date must be in the future"
    );
    error.statusCode = 400;
    throw error;
  }

  const existingCoupon = await prisma.coupon.findUnique({
    where: {
      code,
    },
  });

  if (existingCoupon) {
    const error = new Error("Coupon code already exists");
    error.statusCode = 409;
    throw error;
  }

  return prisma.coupon.create({
    data: {
      code,
      description: description || null,
      discountType,
      discountValue,
      minimumAmount: minimumAmount ?? 0,
      maximumUses: maximumUses ?? null,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      isActive: isActive ?? true,
    },

    include: {
      _count: {
        select: {
          usages: true,
        },
      },
    },
  });
};


const getAdminCoupons = async ({
  page = 1,
  limit = 10,
  search = "",
  discountType,
  isActive,
  sortOrder = "desc",
}) => {
  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;

  const skip = (parsedPage - 1) * parsedLimit;

  const where = {
    ...(search && {
      OR: [
        {
          code: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          description: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),

    ...(discountType && {
      discountType,
    }),

    ...(isActive !== undefined && {
      isActive:
        isActive === true ||
        isActive === "true",
    }),
  };

  const [coupons, total] = await Promise.all([
    prisma.coupon.findMany({
      where,
      skip,
      take: parsedLimit,
      orderBy: {
        createdAt: sortOrder,
      },
      include: {
        _count: {
          select: {
            usages: true,
          },
        },
      },
    }),

    prisma.coupon.count({
      where,
    }),
  ]);

  return {
    coupons,
    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit),
    },
  };
};

const getAdminCouponById = async (couponId) => {
  const coupon = await prisma.coupon.findUnique({
    where: {
      id: couponId,
    },

    include: {
      usages: {
        orderBy: {
          usedAt: "desc",
        },

        include: {
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
      },

      _count: {
        select: {
          usages: true,
        },
      },
    },
  });

  if (!coupon) {
    const error = new Error("Coupon not found");
    error.statusCode = 404;
    throw error;
  }

  return coupon;
};


const updateAdminCoupon = async (couponId, data) => {
  const existingCoupon = await prisma.coupon.findUnique({
    where: {
      id: couponId,
    },
  });

  if (!existingCoupon) {
    const error = new Error("Coupon not found");
    error.statusCode = 404;
    throw error;
  }

  if (
    data.discountType === "PERCENTAGE" &&
    data.discountValue !== undefined &&
    Number(data.discountValue) > 100
  ) {
    const error = new Error(
      "Percentage discount cannot be greater than 100"
    );
    error.statusCode = 400;
    throw error;
  }

  const finalDiscountType =
    data.discountType ?? existingCoupon.discountType;

  const finalDiscountValue =
    data.discountValue ?? existingCoupon.discountValue;

  if (
    finalDiscountType === "PERCENTAGE" &&
    Number(finalDiscountValue) > 100
  ) {
    const error = new Error(
      "Percentage discount cannot be greater than 100"
    );
    error.statusCode = 400;
    throw error;
  }

  if (
    data.expiresAt &&
    new Date(data.expiresAt) <= new Date()
  ) {
    const error = new Error(
      "Coupon expiry date must be in the future"
    );
    error.statusCode = 400;
    throw error;
  }

  if (data.code && data.code !== existingCoupon.code) {
    const duplicateCoupon = await prisma.coupon.findUnique({
      where: {
        code: data.code,
      },
    });

    if (duplicateCoupon) {
      const error = new Error("Coupon code already exists");
      error.statusCode = 409;
      throw error;
    }
  }

  return prisma.coupon.update({
    where: {
      id: couponId,
    },

    data: {
      ...(data.code !== undefined && {
        code: data.code,
      }),

      ...(data.description !== undefined && {
        description: data.description || null,
      }),

      ...(data.discountType !== undefined && {
        discountType: data.discountType,
      }),

      ...(data.discountValue !== undefined && {
        discountValue: data.discountValue,
      }),

      ...(data.minimumAmount !== undefined && {
        minimumAmount: data.minimumAmount,
      }),

      ...(data.maximumUses !== undefined && {
        maximumUses: data.maximumUses,
      }),

      ...(data.expiresAt !== undefined && {
        expiresAt: data.expiresAt
          ? new Date(data.expiresAt)
          : null,
      }),

      ...(data.isActive !== undefined && {
        isActive: data.isActive,
      }),
    },

    include: {
      _count: {
        select: {
          usages: true,
        },
      },
    },
  });
};


const updateAdminCouponStatus = async (
  couponId,
  isActive
) => {
  const existingCoupon = await prisma.coupon.findUnique({
    where: {
      id: couponId,
    },
  });

  if (!existingCoupon) {
    const error = new Error("Coupon not found");
    error.statusCode = 404;
    throw error;
  }

  return prisma.coupon.update({
    where: {
      id: couponId,
    },

    data: {
      isActive,
    },

    include: {
      _count: {
        select: {
          usages: true,
        },
      },
    },
  });
};


const deleteAdminCoupon = async (couponId) => {
  const coupon = await prisma.coupon.findUnique({
    where: {
      id: couponId,
    },

    include: {
      _count: {
        select: {
          usages: true,
        },
      },
    },
  });

  if (!coupon) {
    const error = new Error("Coupon not found");
    error.statusCode = 404;
    throw error;
  }

  if (coupon._count.usages > 0) {
    const error = new Error(
      "Cannot delete a coupon that has been used"
    );
    error.statusCode = 409;
    throw error;
  }

  await prisma.coupon.delete({
    where: {
      id: couponId,
    },
  });

  return {
    id: couponId,
    deleted: true,
  };
};

const getAdminReviews = async ({
  page = 1,
  limit = 10,
  search = "",
  productId,
  userId,
  rating,
  isApproved,
  sortOrder = "desc",
}) => {
  const parsedPage = Number(page) || 1;
  const parsedLimit = Number(limit) || 10;

  const skip = (parsedPage - 1) * parsedLimit;

  const where = {
    ...(productId && {
      productId,
    }),

    ...(userId && {
      userId,
    }),

    ...(rating !== undefined && {
      rating: Number(rating),
    }),

    ...(isApproved !== undefined && {
      isApproved:
        isApproved === true ||
        isApproved === "true",
    }),

    ...(search && {
      OR: [
        {
          comment: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          user: {
            email: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            firstName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          user: {
            lastName: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
        {
          product: {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },
        },
      ],
    }),
  };

  const [reviews, total] = await Promise.all([
    prisma.review.findMany({
      where,
      skip,
      take: parsedLimit,

      orderBy: {
        createdAt: sortOrder,
      },

      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },

        product: {
          select: {
            id: true,
            name: true,
            slug: true,
            sku: true,
          },
        },
      },
    }),

    prisma.review.count({
      where,
    }),
  ]);

  return {
    reviews,

    pagination: {
      page: parsedPage,
      limit: parsedLimit,
      total,
      totalPages: Math.ceil(total / parsedLimit),
    },
  };
};

const getAdminReviewById = async (reviewId) => {
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
          email: true,
          phone: true,
        },
      },

      product: {
        select: {
          id: true,
          name: true,
          slug: true,
          sku: true,
          price: true,
        },
      },
    },
  });

  if (!review) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  return review;
};


const updateAdminReviewApproval = async (
  reviewId,
  isApproved
) => {
  const existingReview = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!existingReview) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
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
          email: true,
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


const deleteAdminReview = async (reviewId) => {
  const existingReview = await prisma.review.findUnique({
    where: {
      id: reviewId,
    },
  });

  if (!existingReview) {
    const error = new Error("Review not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.review.delete({
    where: {
      id: reviewId,
    },
  });

  return {
    id: reviewId,
    deleted: true,
  };
};

module.exports = {
  getDashboardStats,

  getUsers,
  getUserById,
  updateUserStatus,
  deleteUser,

  createAdminProduct,
  getAdminProducts,
  getAdminProductById,
  updateAdminProduct,
  updateAdminProductStatus,
  deleteAdminProduct,

  createAdminCategory,
  getAdminCategories,
  getAdminCategoryById,
  updateAdminCategory,
  updateAdminCategoryStatus,
  deleteAdminCategory,

  getAdminOrders,
  getAdminOrderById,
  updateAdminOrderStatus,

  getAdminPayments,
  getAdminPaymentById,
  getAdminPaymentStats,


  createAdminCoupon,
  getAdminCoupons,
  getAdminCouponById,
  updateAdminCoupon,
  updateAdminCouponStatus,
  deleteAdminCoupon,


  getAdminReviews,
  getAdminReviewById,
  updateAdminReviewApproval,
  deleteAdminReview,
};