const express = require("express");

const addressController = require("../controllers/address.controller");
const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createAddressSchema,
  updateAddressSchema,
} = require("../validators/address.validator");

const router = express.Router();

router.post(
  "/",
  protect,
  validate(createAddressSchema),
  addressController.createAddress
);

router.get(
  "/",
  protect,
  addressController.getAddresses
);

router.get(
  "/:addressId",
  protect,
  addressController.getAddressById
);

router.put(
  "/:addressId",
  protect,
  validate(updateAddressSchema),
  addressController.updateAddress
);

router.delete(
  "/:addressId",
  protect,
  addressController.deleteAddress
);

router.patch(
  "/:addressId/default",
  protect,
  addressController.setDefaultAddress
);

module.exports = router;