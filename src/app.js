const express = require("express");
const cors = require("cors");
const helmet = require("helmet");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const categoryRoutes = require("./routes/category.routes");
const productRoutes = require("./routes/product.routes");
const uploadRoutes = require("./routes/upload.routes");
const errorHandler = require("./middleware/error.middleware");
const cartRoutes = require("./routes/cart.routes");
const wishlistRoutes = require("./routes/wishlist.routes");
const addressRoutes = require("./routes/address.routes");
const orderRoutes = require("./routes/order.routes");
const paymentRoutes = require("./routes/payment.routes");
const webhookRoutes = require("./routes/webhook.routes"); 
const reviewRoutes = require("./routes/review.routes");
const adminRoutes = require("./routes/admin.routes");
const couponRoutes = require("./routes/coupon.routes");

const {
  generalLimiter,
  authLimiter,
} = require("./middleware/rateLimit.middleware");

const app = express();
app.use(generalLimiter);
app.use(helmet());
const allowedOrigins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);
if (process.env.FRONTEND_URL) {
  allowedOrigins.push(new URL(process.env.FRONTEND_URL).origin);
}
app.use(
  cors({
    origin(origin, callback) {
      const isAllowed =
        !origin ||
        process.env.NODE_ENV !== "production" ||
        allowedOrigins.includes(origin);
      callback(null, isAllowed);
    },
  })
);

app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf;
    },
  })
);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message: "Welcome to Gadget Hub API",
  });
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/addresses", addressRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/webhooks", webhookRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/admin/uploads", uploadRoutes);
app.use("/api/coupons", couponRoutes);

// 404 - Route not found
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.originalUrl}`,
  });
});

app.use(errorHandler);


module.exports = app;