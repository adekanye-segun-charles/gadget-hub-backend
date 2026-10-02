const prisma = require("../config/database");
const generateSlug = require("../utils/generateSlug");

const createCategory = async ({ name, description, image }) => {
  const slug = generateSlug(name);

  const existingCategory = await prisma.category.findFirst({
    where: {
      OR: [
        { name },
        { slug },
      ],
    },
  });

  if (existingCategory) {
    throw new Error("Category already exists");
  }

  const category = await prisma.category.create({
    data: {
      name,
      slug,
      description,
      image,
    },
  });

  return category;
};

const getAllCategories = async () => {
  const categories = await prisma.category.findMany({
    where: {
      isActive: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return categories;
};

const getCategoryById = async (categoryId) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    include: {
      products: {
        where: {
          isActive: true,
        },
      },
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  return category;
};

const updateCategory = async (categoryId, data) => {
  const existingCategory = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
  });

  if (!existingCategory) {
    throw new Error("Category not found");
  }

  const updateData = { ...data };

  if (data.name) {
    updateData.slug = generateSlug(data.name);
  }

  if (data.name || data.slug) {
    const duplicateCategory = await prisma.category.findFirst({
      where: {
        OR: [
          ...(data.name ? [{ name: data.name }] : []),
          ...(updateData.slug ? [{ slug: updateData.slug }] : []),
        ],
        NOT: {
          id: categoryId,
        },
      },
    });

    if (duplicateCategory) {
      throw new Error("Another category with this name already exists");
    }
  }

  const updatedCategory = await prisma.category.update({
    where: {
      id: categoryId,
    },
    data: updateData,
  });

  return updatedCategory;
};

const deleteCategory = async (categoryId) => {
  const category = await prisma.category.findUnique({
    where: {
      id: categoryId,
    },
    include: {
      products: true,
    },
  });

  if (!category) {
    throw new Error("Category not found");
  }

  if (category.products.length > 0) {
    throw new Error(
      "Cannot delete a category that contains products"
    );
  }

  await prisma.category.delete({
    where: {
      id: categoryId,
    },
  });

  return {
    message: "Category deleted successfully",
  };
};

module.exports = {
  createCategory,
  getAllCategories,
  getCategoryById,
  updateCategory,
  deleteCategory,
};