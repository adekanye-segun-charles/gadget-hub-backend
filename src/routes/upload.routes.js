const express = require("express");

const uploadController = require("../controllers/upload.controller");
const protect = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.post(
  "/products/:productId/image",
  protect,
  adminOnly,
  upload.single("image"),
  uploadController.uploadImage
);

router.delete(
  "/image",
  protect,
  adminOnly,
  uploadController.deleteImage
);

router.patch(
  "/products/:productId/image/:imageId/primary",
  protect,
  adminOnly,
  uploadController.setPrimaryImage
);


module.exports = router;