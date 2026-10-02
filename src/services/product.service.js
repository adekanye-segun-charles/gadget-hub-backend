const prisma = require("../config/database");
const generateSlug = require("../utils/generateSlug");

const createProduct = async (data) => {
  const {
    name,
    description,
    price,
    comparePrice,
    stock,
    sku,
    brand,
    specifications,
    isFeatured,
    isActive,
    categoryId,
  } = data;

  // Check if category exists
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  // Don't allow products under an inactive category
  if (!category.isActive) {
    throw new Error("Cannot create a product under an inactive category");
  }

  // Generate product slug
  const slug = generateSlug(name);

  // Check for duplicate SKU or slug
  const existingProduct = await prisma.product.findFirst({
    where: {
      OR: [
        { sku },
        { slug },
      ],
    },
  });

  if (existingProduct) {
    throw new Error("Product with this SKU or name already exists");
  }

  // Create product
  const product = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      price,
      comparePrice,
      stock,
      sku,
      brand,
      specifications,
      isFeatured,
      isActive,
      categoryId,
    },
    include: {
      category: true,
    },
  });

  return product;
};

const getAllProducts = async ({
  page,
  limit,
  search,
  categoryId,
  brand,
  minPrice,
  maxPrice,
  isFeatured,
  sortBy,
  sortOrder,
} = {}) => {
  const price = {};
  if (minPrice !== undefined) price.gte = minPrice;
  if (maxPrice !== undefined) price.lte = maxPrice;

  const where = {
    isActive: true,
    ...(search
      ? {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { description: { contains: search, mode: "insensitive" } },
            { brand: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
    ...(categoryId ? { categoryId } : {}),
    ...(brand ? { brand: { equals: brand, mode: "insensitive" } } : {}),
    ...(Object.keys(price).length ? { price } : {}),
    ...(isFeatured !== undefined ? { isFeatured } : {}),
  };

  const products = await prisma.product.findMany({
    where,
    include: {
      category: true,
      images: true,
    },
    orderBy: {
      [sortBy || "createdAt"]: sortOrder || "desc",
    },
    skip: page && limit ? (page - 1) * limit : undefined,
    take: limit,
  });

  return products;
};

const getProductById = async (productId) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      category: true,
      images: true,
      reviews: true,
    },
  });

  if (!product) {
    throw new Error("Product not found");
  }

  return product;
};

const updateProduct = async (productId, data) => {
  const existingProduct = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!existingProduct) {
    throw new Error("Product not found");
  }

  const updateData = { ...data };

  // If product name changes, generate a new slug
  if (data.name) {
    updateData.slug = generateSlug(data.name);
  }

  // Check category if categoryId is being changed
  if (data.categoryId) {
    const category = await prisma.category.findUnique({
      where: {
        id: data.categoryId,
      },
    });

    if (!category) {
      throw new Error("Category not found");
    }

    if (!category.isActive) {
      throw new Error("Cannot move product to an inactive category");
    }
  }

  // Check for duplicate SKU or slug
  if (data.sku || updateData.slug) {
    const duplicateProduct = await prisma.product.findFirst({
      where: {
        OR: [
          ...(data.sku ? [{ sku: data.sku }] : []),
          ...(updateData.slug ? [{ slug: updateData.slug }] : []),
        ],
        NOT: {
          id: productId,
        },
      },
    });

    if (duplicateProduct) {
      throw new Error("Another product with this SKU or name already exists");
    }
  }

  const updatedProduct = await prisma.product.update({
    where: {
      id: productId,
    },
    data: updateData,
    include: {
      category: true,
      images: true,
    },
  });

  return updatedProduct;
};

const deleteProduct = async (productId) => {
  const product = await prisma.product.findUnique({
    where: {
      id: productId,
    },
  });

  if (!product) {
    throw new Error("Product not found");
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

module.exports = {
  createProduct,
  getAllProducts,
  getProductById,
  updateProduct,
  deleteProduct,
};