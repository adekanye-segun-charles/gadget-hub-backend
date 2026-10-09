const jwt = require("jsonwebtoken");
const { getJwtSecret } = require("../utils/jwt");

const protect = (req, res, next) => {
  let secret;
  try {
    secret = getJwtSecret();
  } catch (error) {
    return res.status(error.statusCode || 503).json({
      success: false,
      message: error.message,
    });
  }

  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, secret);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = protect;