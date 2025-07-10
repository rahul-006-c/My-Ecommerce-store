const jwt = require('jsonwebtoken');
require('dotenv').config(); // To access JWT_SECRET from .env

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d'; // Default to 1 day

if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in .env file.");
  // In a real app, you might want to exit if JWT_SECRET is not set,
  // as it's critical for security. For development, we might allow it
  // but log a prominent warning.
  // For this context, we'll assume it will be set.
}

const generateToken = (userId) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured, cannot generate token.");
  }
  return jwt.sign({ id: userId }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

const verifyToken = (token) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured, cannot verify token.");
  }
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    // Handles expired tokens, invalid signatures, etc.
    console.error("Token verification failed:", error.message);
    return null;
  }
};

module.exports = {
  generateToken,
  verifyToken,
};
