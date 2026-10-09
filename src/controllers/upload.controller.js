const uploadService = require("../services/upload.service");

const uploadImage = async (req, res) => {
  const { productId } = req.params;

  const result = await uploadService.uploadProductImage(
    productId,
    req.file
  );

  return res.status(201).json({
    success: true,
    message: "Product image uploaded successfully",
    data: result,
  });
};

const uploadCategoryImage = async (req, res) => {
  const { categoryId } = req.params;
  const result = await uploadService.uploadCategoryImage(categoryId, req.file);

  return res.status(200).json({
    success: true,
    message: "Category image uploaded successfully",
    data: result,
  });
};

const deleteImage = async (req, res) => {
  const { publicId } = req.body;

  const result = await uploadService.deleteImage(publicId);

  return res.status(200).json({
    success: true,
    message: "Image deleted successfully",
    data: result,
  });
};

const setPrimaryImage = async (req, res) => {
  const { productId, imageId } = req.params;

  const result = await uploadService.setPrimaryImage(
    productId,
    imageId
  );

  return res.status(200).json({
    success: true,
    message: "Primary image updated successfully",
    data: result,
  });
};

module.exports = {
  uploadImage,
  uploadCategoryImage,
  deleteImage,
  setPrimaryImage,
};