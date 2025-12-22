import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import jwt from 'jsonwebtoken';

export const authMiddleware = asyncHandler(async (req, res, next) => {
  // Get token from header
  const authHeader = req.headers.authorization;
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new ApiError(401, 'Access token required');
  }

  const token = authHeader.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'Access token required');
  }

  try {
    // Verify token
    const decodedToken = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    // Attach user to req object
    req.user = {
      _id: decodedToken._id,
      email: decodedToken.email,
      username: decodedToken.username
    };

    next();
  } catch (error) {
    throw new ApiError(401, 'Invalid or expired token');
  }
});
