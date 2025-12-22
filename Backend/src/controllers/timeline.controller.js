import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import TimelineEvent from '../models/timelineEvent.model.js';
import Group from '../models/group.model.js';
import uploadToCloudinary from '../utils/cloudinary.js';

export const createTimelineEvent = asyncHandler(async (req, res) => {
  const { groupId, type, title, description, date, location, linkedExpenseId } = req.body;
  const creatorId = req.user._id;

  // Validate group membership
  const group = await Group.findOne({ _id: groupId, members: creatorId });
  if (!group) {
    throw new ApiError(403, 'You are not a member of this group');
  }

  // Handle multiple photo uploads
  const photoUrls = [];
  if (req.files && req.files.length > 0) {
    for (const file of req.files) {
      const url = await uploadToCloudinary(file.path, 'mixi/timeline');
      photoUrls.push(url);
    }
  }

  // Parse location if provided
  let parsedLocation = null;
  if (location) {
    try {
      parsedLocation = JSON.parse(location);
    } catch (error) {
      throw new ApiError(400, 'Invalid location format');
    }
  }

  // Create timeline event
  const event = await TimelineEvent.create({
    groupId,
    creatorId,
    type,
    title,
    description: description?.trim() || undefined,
    date: new Date(date),
    location: parsedLocation,
    photos: photoUrls,
    linkedExpenseId
  });

  // Update group last activity
  group.lastActivity = new Date();
  await group.save();

  await event.populate('creatorId', 'name username profilePicture');

  res.status(201).json(
    new ApiResponse(201, 'Timeline event created successfully', {
      event: {
        _id: event._id,
        groupId: event.groupId,
        creatorId: event.creatorId._id,
        creatorName: event.creatorId.name,
        type: event.type,
        title: event.title,
        description: event.description,
        date: event.date,
        location: event.location,
        photos: event.photos,
        linkedExpenseId: event.linkedExpenseId,
        createdAt: event.createdAt
      }
    })
  );
});

export const getGroupTimeline = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { limit = 50 } = req.query;
  const userId = req.user._id;

  // Validate group membership
  const group = await Group.findOne({ _id: groupId, members: userId });
  if (!group) {
    throw new ApiError(403, 'You are not a member of this group');
  }

  const events = await TimelineEvent.find({ groupId })
    .populate('creatorId', 'name username profilePicture')
    .sort({ date: -1 })
    .limit(parseInt(limit))
    .lean();

  res.status(200).json(
    new ApiResponse(200, 'Timeline events fetched successfully', { 
      events,
      count: events.length 
    })
  );
});

export const updateTimelineEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const creatorId = req.user._id;
  const updates = req.body;

  const event = await TimelineEvent.findOne({ 
    _id: eventId, 
    creatorId 
  }).populate('creatorId', 'name');

  if (!event) {
    throw new ApiError(404, 'Event not found or you are not the creator');
  }

  // Handle photo updates
  const photoUrls = event.photos || [];
  if (req.files && req.files.length > 0) {
    // Clear old photos (simplified - in production, you'd want to delete from Cloudinary)
    photoUrls.length = 0;
    for (const file of req.files) {
      const url = await uploadToCloudinary(file.path, 'mixi/timeline');
      photoUrls.push(url);
    }
  }

  const updateData = {
    ...updates,
    photos: photoUrls.length > 0 ? photoUrls : event.photos,
    updatedAt: new Date()
  };

  const updatedEvent = await TimelineEvent.findByIdAndUpdate(
    eventId,
    updateData,
    { new: true, runValidators: true }
  ).populate('creatorId', 'name username profilePicture');

  res.status(200).json(
    new ApiResponse(200, 'Timeline event updated successfully', {
      event: updatedEvent
    })
  );
});

export const deleteTimelineEvent = asyncHandler(async (req, res) => {
  const { eventId } = req.params;
  const creatorId = req.user._id;

  const event = await TimelineEvent.findOneAndDelete({ 
    _id: eventId, 
    creatorId 
  });

  if (!event) {
    throw new ApiError(404, 'Event not found or you are not the creator');
  }

  res.status(200).json(
    new ApiResponse(200, 'Timeline event deleted successfully')
  );
});
