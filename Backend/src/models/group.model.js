import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Group name cannot exceed 100 characters']
  },
  photo: {
    type: String, // Cloudinary URL
    default: null
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
    default: null
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  type: {
    type: String,
    enum: ['trip', 'project', 'household', 'event', 'custom'],
    default: 'custom'
  },
  currency: {
    type: String,
    required: true,
    default: 'INR',
    match: [/^[A-Z]{3}$/, 'Currency must be 3 uppercase letters (e.g., INR, USD)']
  },
  memberCount: {
    type: Number,
    default: 1,
    min: [1, 'Group must have at least 1 member']
  },
  totalExpenses: {
    type: Number,
    default: 0,
    min: 0
  },
  totalBalance: {
    type: Number,
    default: 0
  },
  lastActivity: {
    type: Date,
    default: Date.now
  },
  isPrivate: {
    type: Boolean,
    default: false
  },
  allowPersonalExpenses: {
    type: Boolean,
    default: true
  },
  expenseSplitDefault: {
    type: String,
    enum: ['equal', 'shares', 'percent', 'exact'],
    default: 'equal'
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }]
}, {
  timestamps: true
});

// Index for efficient queries
groupSchema.index({ adminId: 1 });
groupSchema.index({ 'members': 1 });
groupSchema.index({ lastActivity: -1 });

export default mongoose.model('Group', groupSchema);
