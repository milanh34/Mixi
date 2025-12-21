import mongoose, { Schema } from "mongoose";

const subscriptionSchema = new Schema(
    {
        email: {
            type: String,
            required: [true, "Email is required"],
            unique: true,
            lowercase: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["active", "unsubscribed", "pending"],
            default: "pending"
        },
        subscriptionDate: {
            type: Date,
            default: Date.now
        },
        unsubscribeDate: {
            type: Date
        },
        lastEmailSent: {
            type: Date
        },
    },
    { timestamps: true }
);

subscriptionSchema.index({ email: 1 });

export const Subscription = mongoose.model("Subscription", subscriptionSchema);
