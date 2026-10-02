const express = require("express");
const categoryController = require("../controllers/category.controller");
const protect = require("../middleware/auth.middleware");
const adminOnly = require("../middleware/admin.middleware");
const validate = require("../middleware/validate.middleware");

const {
  createCategorySchema,
  updateCategorySchema,
} = require("../validators/category.validator");

const router = express.Router();

// Public routes
router.get("/", categoryController.getAllCategories);
router.get("/:id", categoryController.getCategoryById);

// Admin routes
router.post(
  "/",
  protect,
  adminOnly,
  validate(createCategorySchema),
  categoryController.createCategory
);

router.put(
  "/:id",
  protect,
  adminOnly,
  validate(updateCategorySchema),
  categoryController.updateCategory
);

router.delete(
  "/:id",
  protect,
  adminOnly,
  categoryController.deleteCategory
);

module.exports = router;