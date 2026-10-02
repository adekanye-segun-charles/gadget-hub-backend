const cloudinary = require("../config/cloudinary");
const prisma = require("../config/database");

const uploadProductImage = (productId, file) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!file) {
        const error = new Error("Image file is required");
        error.statusCode = 400;
        return reject(error);
      }

      // Check that the product exists
      const product = await prisma.product.findUnique({
        where: {
          id: productId,
        },
      });

      if (!product) {
        const error = new Error("Product not found");
        error.statusCode = 404;
        return reject(error);
      }

      // Upload image to Cloudinary
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder: "gadget-hub/products",
          resource_type: "image",
        },
        async (error, result) => {
          if (error) {
            return reject(error);
          }

          try {
            // Check if this product already has an image
            const imageCount = await prisma.productImage.count({
              where: {
                productId,
              },
            });

            // First image becomes primary automatically
            const isPrimary = imageCount === 0;

            const image = await prisma.productImage.create({
              data: {
                productId,
                url: result.secure_url,
                publicId: result.public_id,
                isPrimary,
              },
            });

            resolve({
              id: image.id,
              productId: image.productId,
              url: image.url,
              publicId: image.publicId,
              isPrimary: image.isPrimary,
              width: result.width,
              height: result.height,
              format: result.format,
              bytes: result.bytes,
            });
          } catch (dbError) {
            // If database save fails, remove the uploaded Cloudinary image
            await cloudinary.uploader.destroy(result.public_id, {
              resource_type: "image",
            });

            reject(dbError);
          }
        }
      );

      uploadStream.end(file.buffer);
    } catch (error) {
      reject(error);
    }
  });
};

const deleteImage = async (publicId) => {
  if (!publicId) {
    const error = new Error("Cloudinary public ID is required");
    error.statusCode = 400;
    throw error;
  }

  const result = await cloudinary.uploader.destroy(publicId, {
    resource_type: "image",
  });

  if (result.result !== "ok") {
    const error = new Error("Image could not be deleted from Cloudinary");
    error.statusCode = 400;
    throw error;
  }

  // Remove image record from database
  await prisma.productImage.deleteMany({
    where: {
      publicId,
    },
  });

  return {
    publicId,
    deleted: true,
  };
};

const setPrimaryImage = async (productId, imageId) => {
  const image = await prisma.productImage.findFirst({
    where: {
      id: imageId,
      productId,
    },
  });

  if (!image) {
    const error = new Error("Product image not found");
    error.statusCode = 404;
    throw error;
  }

  await prisma.productImage.updateMany({
    where: {
      productId,
    },
    data: {
      isPrimary: false,
    },
  });

  const updatedImage = await prisma.productImage.update({
    where: {
      id: imageId,
    },
    data: {
      isPrimary: true,
    },
  });

  return updatedImage;
};

module.exports = {
  uploadProductImage,
  deleteImage,
  setPrimaryImage,
};