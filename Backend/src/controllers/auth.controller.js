import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import User from '../models/user.model.js';
import jwt from 'jsonwebtoken';

export const registerUser = asyncHandler(async (req, res) => {
  const { email, username, password, name } = req.body;

  // Validate required fields
  if (!email || !username || !password || !name) {
    throw new ApiError(400, 'All fields are required');
  }

  // Check if user already exists
  const existingUser = await User.findOne({
    $or: [{ email }, { username }]
  });

  if (existingUser) {
    throw new ApiError(409, 'User already exists with this email or username');
  }

  // Create user
  const user = await User.create({
    uid: `mixi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // Temp UID (replace with Firebase later)
    email,
    username,
    password,
    name,
    preferences: {
      theme: 'system',
      primaryColor: '#4285F4'
    },
    stats: {
      totalGroups: 0,
      totalExpenses: 0,
      totalBalance: 0
    }
  });

  // Generate JWT token
  const token = jwt.sign(
    { _id: user._id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const responseData = {
    token,
    user: {
      _id: user._id,
      uid: user.uid,
      email: user.email,
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
      bio: user.bio,
      preferences: user.preferences,
      stats: user.stats,
      isActive: user.isActive,
      createdAt: user.createdAt
    }
  };

  res.status(201).json(
    new ApiResponse(201, 'User registered successfully', responseData)
  );
});

export const loginUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new ApiError(400, 'Email and password are required');
  }

  // Find user
  const user = await User.findOne({ email }).select('+password');

  if (!user || !(await user.isPasswordCorrect(password))) {
    throw new ApiError(401, 'Invalid email or password');
  }

  if (!user.isActive) {
    throw new ApiError(403, 'Account is deactivated');
  }

  // Generate JWT token
  const token = jwt.sign(
    { _id: user._id, email: user.email, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );

  const responseData = {
    token,
    user: {
      _id: user._id,
      uid: user.uid,
      email: user.email,
      username: user.username,
      name: user.name,
      profilePicture: user.profilePicture,
      bio: user.bio,
      preferences: user.preferences,
      stats: user.stats,
      isActive: user.isActive,
      createdAt: user.createdAt
    }
  };

  res.status(200).json(
    new ApiResponse(200, 'Login successful', responseData)
  );
});

export const refreshToken = asyncHandler(async (req, res) => {
  const token = req.headers.authorization?.split(' ')[1];

  if (!token) {
    throw new ApiError(401, 'No token provided');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded._id).select('-password');

    if (!user) {
      throw new ApiError(401, 'Invalid token');
    }

    const newToken = jwt.sign(
      { _id: user._id, email: user.email, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(200).json(
      new ApiResponse(200, 'Token refreshed', { token: newToken })
    );
  } catch (error) {
    throw new ApiError(401, 'Token expired or invalid');
  }
});
