const validateQuery = (schema) => (req, res, next) => {
  const { error, value } = schema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json({
      success: false,
      message: "Invalid query parameters",
      errors: error.details.map((detail) => detail.message),
    });
  }

  req.validatedQuery = value;
  next();
};

module.exports = validateQuery;
