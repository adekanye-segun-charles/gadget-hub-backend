const addressService = require("../services/address.service");

const createAddress = async (req, res, next) => {
  try {
    const address = await addressService.createAddress(
      req.user.userId,
      req.body
    );

    res.status(201).json({
      success: true,
      message: "Address created successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

const getAddresses = async (req, res, next) => {
  try {
    const addresses = await addressService.getAddresses(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Addresses retrieved successfully",
      data: addresses,
    });
  } catch (error) {
    next(error);
  }
};

const getAddressById = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const address = await addressService.getAddressById(
      req.user.userId,
      addressId
    );

    res.status(200).json({
      success: true,
      message: "Address retrieved successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

const updateAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const address = await addressService.updateAddress(
      req.user.userId,
      addressId,
      req.body
    );

    res.status(200).json({
      success: true,
      message: "Address updated successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

const deleteAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const result = await addressService.deleteAddress(
      req.user.userId,
      addressId
    );

    res.status(200).json({
      success: true,
      message: result.message,
    });
  } catch (error) {
    next(error);
  }
};

const setDefaultAddress = async (req, res, next) => {
  try {
    const { addressId } = req.params;

    const address = await addressService.setDefaultAddress(
      req.user.userId,
      addressId
    );

    res.status(200).json({
      success: true,
      message: "Default address updated successfully",
      data: address,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createAddress,
  getAddresses,
  getAddressById,
  updateAddress,
  deleteAddress,
  setDefaultAddress,
};