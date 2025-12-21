import mongoose, { Schema } from "mongoose";

const groupSchema = new Schema(
  {
    name: { type: String, required: true },
    photo: String, // Cloudinary group cover
    description: String,
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["trip", "project", "household", "event", "custom"],
      required: true,
    },
    currency: { type: String, default: "USD" },
    isPrivate: { type: Boolean, default: true },
    allowPersonalExpenses: { type: Boolean, default: true },
    expenseSplitDefault: {
      type: String,
      enum: ["equal", "shares", "percent", "exact"],
      default: "equal",
    },
    memberCount: { type: Number, default: 1 },
    totalExpenses: { type: Number, default: 0 },
    totalBalance: { type: Number, default: 0 },
    lastActivity: { type: Date, default: Date.now },
  },
  { timestamps: true }
);
