import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    maxlength: [100, 'Location name cannot exceed 100 characters']
  },
  lat: {
    type: Number,
    required: true,
    min: -90,
    max: 90
  },
  lng: {
    type: Number,
    required: true,
    min: -180,
    max: 180
  },
  address: {
    type: String,
    maxlength: [200, 'Address cannot exceed 200 characters']
  }
});

const timelineEventSchema = new mongoose.Schema({
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
    enum: ['milestone', 'payment', 'movement', 'completion'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters']
  },
  date: {
    type: Date,
    required: true
  },
  location: {
    type: locationSchema,
    default: null
  },
  photos: [{
    type: String, // Cloudinary URLs
    default: []
  }],
  linkedExpenseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'GroupExpense',
    default: null
  }
}, {
  timestamps: true
});

// Indexes
timelineEventSchema.index({ groupId: 1, date: -1 });
timelineEventSchema.index({ groupId: 1, creatorId: 1 });

export default mongoose.model('TimelineEvent', timelineEventSchema);
