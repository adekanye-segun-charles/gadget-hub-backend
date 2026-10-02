const express = require("express");

const userController = require("../controllers/user.controller");

const protect = require("../middleware/auth.middleware");
const validate = require("../middleware/validate.middleware");

const {
  updateProfileSchema,
  changePasswordSchema,
} = require("../validators/user.validator");

const router = express.Router();


// Get my profile
router.get(
  "/me",
  protect,
  userController.getMe
);


// Update my profile
router.put(
  "/me",
  protect,
  validate(updateProfileSchema),
  userController.updateProfile
);


// Change password
router.patch(
  "/me/password",
  protect,
  validate(changePasswordSchema),
  userController.changePassword
);


// Delete my account
router.delete(
  "/me",
  protect,
  userController.deleteMyAccount
);


module.exports = router;