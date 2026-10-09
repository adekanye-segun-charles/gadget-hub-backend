const errorHandler = (err, req, res, next) => {
  if (err.cause?.isAxiosError) {
    console.error("Payment provider request failed:", {
      method: req.method,
      path: req.originalUrl,
      status: err.cause.response?.status,
      providerCode: err.cause.response?.data?.code,
      message: err.message,
    });
  } else {
    console.error("ERROR:", err);
  }

  if (res.headersSent) {
    return next(err);
  }

  const status = err.statusCode || err.status || 500;
  const message =
    process.env.NODE_ENV === "production" && status >= 500
      ? "Something went wrong on the server. Please try again later."
      : err.message || "Something went wrong";

  res.status(status).json({
    success: false,
    message,
  });
};

module.exports = errorHandler;