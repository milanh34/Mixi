import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      unique: true,
      lowerCase: true,
      trim: true,
      index: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowerCase: true,
      trim: true,
    },
    name: {
      type: String,
      trim: true,
      required: true,
    },
    avatar: {
      type: String, //cloudinary url
      required: false,
    },
    bio: {
      type: String,
      trim: true,
      required: false,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    dob: {
      type: Date,
      required: true,
    },
    refreshToken: {
      type: String,
    },
    stats: {
      totalGroups: { type: Number, default: 0 },
      totalExpenses: { type: Number, default: 0 },
      totalBalance: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
      name: this.name,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    }
  );
};

userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    }
  );
};

export const User = mongoose.model("User", userSchema);
