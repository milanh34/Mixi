import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import Group from '../models/group.model.js';
import User from '../models/user.model.js';
import GroupInvite from '../models/groupInvite.model.js';
import uploadToCloudinary from '../utils/cloudinary.js';
import { generateCode } from '../utils/helpers.js';

export const createGroup = asyncHandler(async (req, res) => {
  const { name, description, type, currency, isPrivate, expenseSplitDefault } = req.body;
  const userId = req.user._id;

  // Validate required fields
  if (!name || !currency) {
    throw new ApiError(400, 'Name and currency are required');
  }

  // Handle group photo upload
  let photoUrl = null;
  if (req.file) {
    photoUrl = await uploadToCloudinary(req.file.path, 'mixi/groups');
  }

  // Create group
  const group = await Group.create({
    name,
    photo: photoUrl,
    description,
    adminId: userId,
    type: type || 'custom',
    currency: currency.toUpperCase(),
    memberCount: 1,
    members: [userId],
    isPrivate: isPrivate || false,
    expenseSplitDefault: expenseSplitDefault || 'equal'
  });

  // Update user's stats
  await User.findByIdAndUpdate(userId, {
    $inc: { 'stats.totalGroups': 1 }
  });

  // Populate admin details
  await group.populate('adminId', 'name username profilePicture');

  res.status(201).json(
    new ApiResponse(201, 'Group created successfully', {
      group: {
        _id: group._id,
        name: group.name,
        photo: group.photo,
        description: group.description,
        adminId: group.adminId._id,
        adminName: group.adminId.name,
        type: group.type,
        currency: group.currency,
        memberCount: group.memberCount,
        totalExpenses: group.totalExpenses,
        totalBalance: group.totalBalance,
        lastActivity: group.lastActivity,
        isPrivate: group.isPrivate,
        allowPersonalExpenses: group.allowPersonalExpenses,
        expenseSplitDefault: group.expenseSplitDefault,
        createdAt: group.createdAt
      }
    })
  );
});

export const getUserGroups = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  const groups = await Group.find({ members: userId })
    .populate('adminId', 'name username profilePicture')
    .sort({ lastActivity: -1 });

  const groupsData = groups.map(group => ({
    _id: group._id,
    name: group.name,
    photo: group.photo,
    description: group.description,
    adminId: group.adminId._id,
    adminName: group.adminId.name,
    type: group.type,
    currency: group.currency,
    memberCount: group.memberCount,
    totalExpenses: group.totalExpenses,
    totalBalance: group.totalBalance,
    lastActivity: group.lastActivity,
    createdAt: group.createdAt
  }));

  res.status(200).json(
    new ApiResponse(200, 'User groups fetched successfully', { groups: groupsData })
  );
});

export const getGroupById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const group = await Group.findOne({ _id: id, members: userId })
    .populate('adminId', 'name username profilePicture')
    .populate('members', 'name username profilePicture');

  if (!group) {
    throw new ApiError(404, 'Group not found or you are not a member');
  }

  const groupData = {
    _id: group._id,
    name: group.name,
    photo: group.photo,
    description: group.description,
    adminId: group.adminId._id,
    adminName: group.adminId.name,
    type: group.type,
    currency: group.currency,
    memberCount: group.memberCount,
    totalExpenses: group.totalExpenses,
    totalBalance: group.totalBalance,
    lastActivity: group.lastActivity,
    isPrivate: group.isPrivate,
    allowPersonalExpenses: group.allowPersonalExpenses,
    expenseSplitDefault: group.expenseSplitDefault,
    members: group.members.map(member => ({
      _id: member._id,
      name: member.name,
      username: member.username,
      profilePicture: member.profilePicture,
      role: member._id.equals(group.adminId._id) ? 'admin' : 'member'
    })),
    createdAt: group.createdAt
  };

  res.status(200).json(
    new ApiResponse(200, 'Group details fetched successfully', { group: groupData })
  );
});

export const joinGroupByCode = asyncHandler(async (req, res) => {
  const { code } = req.params;
  const userId = req.user._id;

  // Find invite
  const invite = await GroupInvite.findOne({ 
    code: code.toUpperCase(),
    expiresAt: { $gt: new Date() },
    uses: { $lt: this.maxUses }
  }).populate('groupId', 'name members memberCount adminId');

  if (!invite) {
    throw new ApiError(404, 'Invalid or expired invite code');
  }

  const group = invite.groupId;

  // Check if user is already member
  if (group.members.includes(userId)) {
    throw new ApiError(400, 'You are already a member of this group');
  }

  // Add user to group
  group.members.push(userId);
  group.memberCount += 1;
  group.lastActivity = new Date();
  await group.save();

  // Update invite usage
  invite.uses += 1;
  await invite.save();

  // Update user stats
  await User.findByIdAndUpdate(userId, {
    $inc: { 'stats.totalGroups': 1 }
  });

  // Populate new member data
  await group.populate('adminId members', 'name username profilePicture');

  res.status(200).json(
    new ApiResponse(200, 'Successfully joined group', {
      groupId: group._id,
      groupName: group.name
    })
  );
});

export const generateGroupInvite = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;
  const { type = 'link', maxUses = 10, expiresInHours = 24 } = req.body;

  const group = await Group.findOne({ _id: id, adminId: userId });
  if (!group) {
    throw new ApiError(404, 'Group not found or you are not admin');
  }

  const code = `MIXI-${generateCode(6)}`;
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);

  const invite = await GroupInvite.create({
    groupId: group._id,
    adminId: userId,
    code,
    type,
    maxUses,
    expiresAt
  });

  res.status(201).json(
    new ApiResponse(201, 'Invite generated successfully', {
      id: invite._id,
      code: invite.code,
      type: invite.type,
      maxUses: invite.maxUses,
      uses: invite.uses,
      expiresAt: invite.expiresAt
    })
  );
});

export const getGroupInvites = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user._id;

  const group = await Group.findOne({ _id: id, adminId: userId });
  if (!group) {
    throw new ApiError(403, 'Not authorized to view invites');
  }

  const invites = await GroupInvite.find({ groupId: group._id })
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(200, 'Invites fetched successfully', { invites })
  );
});
