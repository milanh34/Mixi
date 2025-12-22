import { asyncHandler } from '../utils/asyncHandler.js';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import GroupExpense from '../models/expense.model.js';
import Group from '../models/group.model.js';
import User from '../models/user.model.js';
import uploadToCloudinary from '../utils/cloudinary.js';

const calculateEqualSplit = (amount, memberIds, paidBy) => {
  const perPerson = amount / memberIds.length;
  return memberIds.map(userId => ({
    userId,
    share: 1,
    percent: 100 / memberIds.length,
    exactAmount: perPerson,
    paidBy
  }));
};

const calculateShareSplit = (amount, shares, paidBy) => {
  const totalShares = shares.reduce((sum, s) => sum + s.share, 0);
  return shares.map(({ userId, share }) => ({
    userId,
    share,
    percent: (share / totalShares) * 100,
    exactAmount: (amount * share) / totalShares,
    paidBy
  }));
};

const calculatePercentSplit = (amount, percents, paidBy) => {
  return percents.map(({ userId, percent }) => ({
    userId,
    share: percent / 100,
    percent,
    exactAmount: (amount * percent) / 100,
    paidBy
  }));
};

const calculateExactSplit = (amounts, paidBy) => {
  return amounts.map(({ userId, amount }) => ({
    userId,
    share: amount / amounts.reduce((sum, a) => sum + a.amount, 0),
    percent: (amount / amounts.reduce((sum, a) => sum + a.amount, 0)) * 100,
    exactAmount: amount,
    paidBy
  }));
};

export const createExpense = asyncHandler(async (req, res) => {
  const { groupId, type, title, amount, currency, category, description, splitType, splitDetails } = req.body;
  const creatorId = req.user._id;

  // Validate group membership
  const group = await Group.findOne({ _id: groupId, members: creatorId });
  if (!group) {
    throw new ApiError(403, 'You are not a member of this group');
  }

  // Validate required fields
  if (!title || !amount || !category) {
    throw new ApiError(400, 'Title, amount, and category are required');
  }

  const amountNum = parseFloat(amount);
  if (amountNum <= 0) {
    throw new ApiError(400, 'Amount must be greater than 0');
  }

  let calculatedSplitDetails;

  if (type === 'personal') {
    // Personal expense - creator pays everything
    calculatedSplitDetails = [{
      userId: creatorId,
      share: 1,
      percent: 100,
      exactAmount: amountNum,
      paidBy: creatorId
    }];
  } else {
    // Shared expense - get group members
    const memberIds = group.members.map(m => m.toString());

    switch (splitType) {
      case 'equal':
        calculatedSplitDetails = calculateEqualSplit(amountNum, memberIds, creatorId);
        break;
      case 'shares':
        calculatedSplitDetails = calculateShareSplit(
          amountNum,
          JSON.parse(splitDetails || '[]'),
          creatorId
        );
        break;
      case 'percent':
        calculatedSplitDetails = calculatePercentSplit(
          amountNum,
          JSON.parse(splitDetails || '[]'),
          creatorId
        );
        break;
      case 'exact':
        calculatedSplitDetails = calculateExactSplit(
          JSON.parse(splitDetails || '[]'),
          creatorId
        );
        break;
      default:
        calculatedSplitDetails = calculateEqualSplit(amountNum, memberIds, creatorId);
    }
  }

  // Handle receipt photo upload
  let receiptPhotoUrl = null;
  if (req.file) {
    receiptPhotoUrl = await uploadToCloudinary(req.file.path, 'mixi/receipts');
  }

  // Create expense
  const expense = await GroupExpense.create({
    groupId,
    creatorId,
    type,
    title,
    amount: amountNum,
    currency: currency.toUpperCase(),
    category,
    date: new Date(),
    description: description?.trim() || undefined,
    receiptPhoto: receiptPhotoUrl,
    splitType: type === 'personal' ? 'equal' : splitType,
    splitDetails: calculatedSplitDetails,
    settled: false
  });

  // Update group stats
  group.totalExpenses += amountNum;
  group.lastActivity = new Date();
  await group.save();

  // Update creator stats
  await User.findByIdAndUpdate(creatorId, {
    $inc: { 
      'stats.totalExpenses': 1,
      'stats.totalBalance': 0 // Will be calculated later
    }
  });

  await expense.populate('creatorId', 'name username profilePicture');

  res.status(201).json(
    new ApiResponse(201, 'Expense created successfully', {
      expense: {
        _id: expense._id,
        groupId: expense.groupId,
        creatorId: expense.creatorId._id,
        creatorName: expense.creatorId.name,
        type: expense.type,
        title: expense.title,
        amount: expense.amount,
        currency: expense.currency,
        category: expense.category,
        date: expense.date,
        description: expense.description,
        receiptPhoto: expense.receiptPhoto,
        splitType: expense.splitType,
        splitDetails: expense.splitDetails,
        settled: expense.settled,
        createdAt: expense.createdAt
      }
    })
  );
});

export const getGroupExpenses = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const { type, limit = 50 } = req.query;
  const userId = req.user._id;

  // Validate group membership
  const group = await Group.findOne({ _id: groupId, members: userId });
  if (!group) {
    throw new ApiError(403, 'You are not a member of this group');
  }

  const query = { groupId };

  if (type === 'personal' || type === 'shared') {
    query.type = type;
  }

  const expenses = await GroupExpense.find(query)
    .populate('creatorId', 'name username profilePicture')
    .sort({ date: -1 })
    .limit(parseInt(limit))
    .lean();

  res.status(200).json(
    new ApiResponse(200, 'Expenses fetched successfully', { 
      expenses,
      count: expenses.length 
    })
  );
});

export const getPersonalExpenses = asyncHandler(async (req, res) => {
  const { groupId } = req.params;
  const userId = req.user._id;

  const expenses = await GroupExpense.find({
    groupId,
    creatorId: userId,
    type: 'personal'
  })
    .populate('creatorId', 'name')
    .sort({ date: -1 })
    .lean();

  res.status(200).json(
    new ApiResponse(200, 'Personal expenses fetched successfully', { expenses })
  );
});

export const settleExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const userId = req.user._id;

  const expense = await GroupExpense.findById(expenseId)
    .populate('groupId creatorId', 'name members');

  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  // Check group membership
  if (!expense.groupId.members.includes(userId)) {
    throw new ApiError(403, 'Not a group member');
  }

  if (expense.settled) {
    throw new ApiError(400, 'Expense already settled');
  }

  // Mark as settled
  expense.settled = true;
  expense.settledAt = new Date();
  expense.settledBy = userId;
  await expense.save();

  // Update group stats (reset balance for simplicity)
  await Group.findByIdAndUpdate(expense.groupId._id, {
    $inc: { totalBalance: 0 }, // Complex settlement logic later
    lastActivity: new Date()
  });

  res.status(200).json(
    new ApiResponse(200, 'Expense settled successfully', {
      expenseId: expense._id,
      settled: true,
      settledAt: expense.settledAt
    })
  );
});

export const deleteExpense = asyncHandler(async (req, res) => {
  const { expenseId } = req.params;
  const userId = req.user._id;

  const expense = await GroupExpense.findById(expenseId)
    .populate('groupId creatorId', 'name members');

  if (!expense) {
    throw new ApiError(404, 'Expense not found');
  }

  if (!expense.groupId.members.includes(userId) || expense.creatorId._id.toString() !== userId.toString()) {
    throw new ApiError(403, 'Not authorized to delete this expense');
  }

  await GroupExpense.findByIdAndDelete(expenseId);

  // Update stats
  await User.findByIdAndUpdate(userId, {
    $inc: { 'stats.totalExpenses': -1 }
  });

  res.status(200).json(
    new ApiResponse(200, 'Expense deleted successfully')
  );
});
