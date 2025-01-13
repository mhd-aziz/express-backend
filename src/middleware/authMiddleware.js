const { verifyToken } = require("../utils/jwtUtils");
const { sendErrorResponse } = require("../utils/errorUtils");
require("dotenv").config();

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers["authorization"];

  if (!authHeader) {
    return sendErrorResponse(res, 401, "Authorization header missing.");
  }

  const token = authHeader.split(" ")[1];

  if (!token) {
    return sendErrorResponse(res, 401, "Token missing.");
  }

  try {
    const decoded = verifyToken(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return sendErrorResponse(res, 401, "Invalid or expired token.");
  }
};

module.exports = authMiddleware;
