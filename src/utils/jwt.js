const jwt = require("jsonwebtoken");

const getJwtSecret = () => {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret || secret === "replace_with_a_strong_secret") {
    const error = new Error(
      "Authentication is unavailable because JWT_SECRET is not configured on the backend."
    );
    error.statusCode = 503;
    error.isOperational = true;
    throw error;
  }

  return secret;
};

const generateToken = (user) => {
  return jwt.sign(
    {
      userId: user.id,
      role: user.role,
    },
    getJwtSecret(),
    {
      expiresIn: "7d",
    }
  );
};

module.exports = {
  generateToken,
  getJwtSecret,
};
