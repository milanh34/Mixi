import mongoose, { Schema } from "mongoose";

const reviewSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            index: true,
        },
        rating: {
            type: Number,
            required: [true, "Rating is required"],
            min: 1,
            max: 5,
        },
        review: {
            type: String,
            required: [true, "Review text is required"],
            trim: true,
        },
        status: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "pending"
        }
    },
    { 
        timestamps: true 
    }
);

export const Review = mongoose.model("Review", reviewSchema);
