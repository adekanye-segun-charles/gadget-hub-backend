const prisma = require("../config/database");

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
    },
  });

  if (!user) {
    const error = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  return user;
};


const updateProfile = async (userId, data) => {
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

  if (!user.isActive) {
    const error = new Error("Your account is inactive");
    error.statusCode = 403;
    throw error;
  }

  const updatedUser = await prisma.user.update({
    where: {
      id: userId,
    },
    data: {
      ...(data.firstName !== undefined && {
        firstName: data.firstName,
      }),

      ...(data.lastName !== undefined && {
        lastName: data.lastName,
      }),

      ...(data.phone !== undefined && {
        phone: data.phone,
      }),
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
    },
  });

  return updatedUser;
};


const deleteMyAccount = async (userId) => {
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
    const error = new Error("Admin accounts cannot be deleted");
    error.statusCode = 403;
    throw error;
  }

  await prisma.user.delete({
    where: {
      id: userId,
    },
  });

  return {
    deleted: true,
  };
};


module.exports = {
  getUserById,
  updateProfile,
  deleteMyAccount,
};