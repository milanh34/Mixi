import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import User from '../models/user.model.js';
import uploadToCloudinary from '../utils/cloudinary.js';

export const getUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select('-password -__v');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(
    new ApiResponse(200, 'User profile fetched successfully', {
      user: {
        _id: user._id,
        uid: user.uid,
        email: user.email,
        username: user.username,
        name: user.name,
        profilePicture: user.profilePicture,
        bio: user.bio,
        dateOfBirth: user.dateOfBirth,
        phoneNumber: user.phoneNumber,
        address: user.address,
        preferences: user.preferences,
        stats: user.stats,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  );
});

export const updateUserProfile = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const updates = req.body;

  // Validate required fields
  if (updates.email && !/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(updates.email)) {
    throw new ApiError(400, 'Invalid email format');
  }

  if (updates.username && (updates.username.length < 3 || updates.username.length > 20)) {
    throw new ApiError(400, 'Username must be 3-20 characters');
  }

  // Handle profile picture upload
  let profilePictureUrl = null;
  if (req.file) {
    profilePictureUrl = await uploadToCloudinary(req.file.path, 'mixi/profiles');
  }

  const updateData = {
    ...updates,
    ...(profilePictureUrl && { profilePicture: profilePictureUrl }),
    updatedAt: new Date()
  };

  // Remove password from updates (use separate endpoint)
  delete updateData.password;

  const user = await User.findByIdAndUpdate(
    userId,
    updateData,
    { new: true, runValidators: true }
  ).select('-password -__v');

  if (!user) {
    throw new ApiError(404, 'User not found');
  }

  res.status(200).json(
    new ApiResponse(200, 'Profile updated successfully', {
      user: {
        _id: user._id,
        uid: user.uid,
        email: user.email,
        username: user.username,
        name: user.name,
        profilePicture: user.profilePicture,
        bio: user.bio,
        dateOfBirth: user.dateOfBirth,
        phoneNumber: user.phoneNumber,
        address: user.address,
        preferences: user.preferences,
        stats: user.stats,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt
      }
    })
  );
});

export const updateUserStats = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const { totalGroups, totalExpenses, totalBalance } = req.body;

  const user = await User.findByIdAndUpdate(
    userId,
    {
      $set: {
        'stats.totalGroups': totalGroups || 0,
        'stats.totalExpenses': totalExpenses || 0,
        'stats.totalBalance': totalBalance || 0
      },
      updatedAt: new Date()
    },
    { new: true }
  ).select('stats');

  res.status(200).json(
    new ApiResponse(200, 'Stats updated successfully', { stats: user.stats })
  );
});

export const deactivateUser = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const user = await User.findByIdAndUpdate(
    userId,
    { isActive: false },
    { new: true }
  );

  res.status(200).json(
    new ApiResponse(200, 'Account deactivated successfully')
  );
});
