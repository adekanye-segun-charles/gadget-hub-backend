const express = require("express");

const productController = require("../controllers/product.controller");
const protect = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createProductSchema,
  updateProductSchema,
  productQuerySchema,
} = require("../validators/product.validator");
const validateQuery = require("../middleware/validateQuery.middleware");

const router = express.Router();

// Public routes
router.get("/", validateQuery(productQuerySchema), productController.getAllProducts);

router.get("/:id", productController.getProductById);

// Admin routes
router.post(
  "/",
  protect,
  adminOnly,
  validate(createProductSchema),
  productController.createProduct
);

router.put(
  "/:id",
  protect,
  adminOnly,
  validate(updateProductSchema),
  productController.updateProduct
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  productController.deleteProduct
);

module.exports = router;