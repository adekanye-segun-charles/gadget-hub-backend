const prisma = require("../config/database");

const createAddress = async (userId, data) => {
  const { isDefault = false } = data;

  const addressCount = await prisma.address.count({
    where: {
      userId,
    },
  });

  const shouldBeDefault = isDefault || addressCount === 0;

  if (shouldBeDefault) {
    await prisma.address.updateMany({
      where: {
        userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  return prisma.address.create({
    data: {
      userId,
      ...data,
      isDefault: shouldBeDefault,
    },
  });
};

const getAddresses = async (userId) => {
  return prisma.address.findMany({
    where: {
      userId,
    },
    orderBy: [
      {
        isDefault: "desc",
      },
      {
        createdAt: "desc",
      },
    ],
  });
};

const getAddressById = async (userId, addressId) => {
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw new Error("Address not found");
  }

  return address;
};

const updateAddress = async (userId, addressId, data) => {
  const existingAddress = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!existingAddress) {
    throw new Error("Address not found");
  }

  if (data.isDefault === true) {
    await prisma.address.updateMany({
      where: {
        userId,
        isDefault: true,
      },
      data: {
        isDefault: false,
      },
    });
  }

  return prisma.address.update({
    where: {
      id: addressId,
    },
    data,
  });
};

const deleteAddress = async (userId, addressId) => {
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw new Error("Address not found");
  }

  await prisma.address.delete({
    where: {
      id: addressId,
    },
  });

  if (address.isDefault) {
    const nextAddress = await prisma.address.findFirst({
      where: {
        userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (nextAddress) {
      await prisma.address.update({
        where: {
          id: nextAddress.id,
        },
        data: {
          isDefault: true,
        },
      });
    }
  }

  return {
    message: "Address deleted successfully",
  };
};

const setDefaultAddress = async (userId, addressId) => {
  const address = await prisma.address.findFirst({
    where: {
      id: addressId,
      userId,
    },
  });

  if (!address) {
    throw new Error("Address not found");
  }

  await prisma.address.updateMany({
    where: {
      userId,
      isDefault: true,
    },
    data: {
      isDefault: false,
    },
  });

  return prisma.address.update({
    where: {
      id: addressId,
    },
    data: {
      isDefault: true,
    },
  });
};

module.exports = {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};