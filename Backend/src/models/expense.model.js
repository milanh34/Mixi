import mongoose from 'mongoose';

const expenseSplitSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  share: {
    type: Number,
    min: 0,
    default: 0
  },
  percent: {
    type: Number,
    min: 0,
    max: 100,
    default: 0
  },
  exactAmount: {
    type: Number,
    min: 0,
    default: 0
  },
  paidBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
});

const groupExpenseSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
    index: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['personal', 'shared'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  amount: {
    type: Number,
    required: true,
    min: [0.01, 'Amount must be greater than 0']
  },
  currency: {
    type: String,
    required: true,
    match: [/^[A-Z]{3}$/, 'Currency must be 3 uppercase letters']
  },
  category: {
    type: String,
    required: true,
    enum: ['food', 'travel', 'shopping', 'bills', 'entertainment', 'other']
  },
  date: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  receiptPhoto: {
    type: String, // Cloudinary URL
    default: null
  },
  splitType: {
    type: String,
    enum: ['equal', 'shares', 'percent', 'exact'],
    required: true
  },
  splitDetails: {
    type: [expenseSplitSchema],
    required: true,
    validate: {
      validator: function(v) {
        return v.length > 0;
      },
      message: 'Split details cannot be empty'
    }
  },
  settled: {
    type: Boolean,
    default: false
  },
  settledAt: {
    type: Date
  },
  settledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Indexes for efficient queries
groupExpenseSchema.index({ groupId: 1, date: -1 });
groupExpenseSchema.index({ groupId: 1, creatorId: 1, type: 1 });
groupExpenseSchema.index({ groupId: 1, settled: 1 });

export default mongoose.model('GroupExpense', groupExpenseSchema);
