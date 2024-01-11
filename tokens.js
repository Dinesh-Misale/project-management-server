const jwt = require("jsonwebtoken");
require("dotenv").config(); // Load variables from .env into process.env

const secretKey = process.env.PORT;

// Function to generate access token
function generateAccessToken(user) {
  const payload = {
    email: user.email,
    orgId: user.orgId,
    // You can add more claims here
  };
  const options = {
    expiresIn: "15m", // Access token expires in 15 minutes
  };
  return jwt.sign(payload, secretKey, options);
}

// Function to generate refresh token
function generateRefreshToken(user) {
  const payload = {
    email: user.email,
    orgId: user.orgId,
    // You can add more claims here
  };
  const options = {
    expiresIn: "7d", // Refresh token expires in 7 days
  };
  return jwt.sign(payload, secretKey, options);
}

// Function to Validate if the token is valid
function validateToken(token) {
  try {
    const decoded = jwt.verify(token, secretKey);

    // Optionally, you can check if the token has expired
    const currentTimestamp = Math.floor(Date.now() / 1000);
    if (decoded.exp && decoded.exp < currentTimestamp) {
      return { valid: false, reason: "Token has expired" };
    }

    // Optionally, you can check if the token is blacklisted
    // You may need a database or other storage mechanism to do this
    // Example:
    // if (isBlacklisted(token)) {
    //   return { valid: false, reason: 'Token is blacklisted' };
    // }

    return { valid: true, decoded };
  } catch (error) {
    return { valid: false, reason: "Token is invalid" };
  }
}

module.exports = {
  generateAccessToken: generateAccessToken,
  generateRefreshToken: generateRefreshToken,
  validateToken: validateToken,
};
