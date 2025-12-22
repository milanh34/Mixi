import mongoose from 'mongoose';

const groupInviteSchema = new mongoose.Schema({
  groupId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Group',
    required: true,
    index: true
  },
  adminId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  code: {
    type: String,
    required: true,
    unique: true,
    uppercase: true,
    match: [/^MIXI-[A-Z0-9]{6}$/, 'Code must be MIXI-XXXXXX format']
  },
  type: {
    type: String,
    enum: ['qr', 'link', 'code'],
    default: 'link'
  },
  maxUses: {
    type: Number,
    required: true,
    min: [1, 'Max uses must be at least 1'],
    default: 10
  },
  uses: {
    type: Number,
    default: 0,
    min: 0
  },
  expiresAt: {
    type: Date,
    required: true
  }
}, {
  timestamps: true
});

// Auto-expire invites
groupInviteSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model('GroupInvite', groupInviteSchema);
