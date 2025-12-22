import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  uid: {
    type: String,
    required: true,
    unique: true,
    index: true, // Firebase UID compatibility
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  username: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters']
  },
  password: {
    type: String,
    required: true,
    minlength: [6, 'Password must be at least 6 characters']
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  profilePicture: {
    type: String, // Cloudinary URL
    default: null
  },
  bio: {
    type: String,
    maxlength: [200, 'Bio cannot exceed 200 characters'],
    default: null
  },
  dateOfBirth: {
    type: Date,
    default: null
  },
  phoneNumber: {
    type: String,
    match: [/^\+?[1-9]\d{1,14}$/, 'Please enter a valid phone number'],
    default: null
  },
  address: {
    type: String,
    maxlength: [200, 'Address cannot exceed 200 characters'],
    default: null
  },
  preferences: {
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'system'
    },
    primaryColor: {
      type: String,
      default: '#4285F4'
    }
  },
  stats: {
    totalGroups: {
      type: Number,
      default: 0
    },
    totalExpenses: {
      type: Number,
      default: 0
    },
    totalBalance: {
      type: Number,
      default: 0
    }
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Password hashing middleware
userSchema.pre('save', async function() {
  if (!this.isModified('password')) {
    return;
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Password comparison method
userSchema.methods.isPasswordCorrect = async function(
  enteredPassword
) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Exclude password and other sensitive fields from JSON response
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  const { password, __v, ...rest } = user;
  return rest;
};

export default mongoose.model('User', userSchema);
