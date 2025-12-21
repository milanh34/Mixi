import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Review } from "../models/review.models.js";

const createReview = asyncHandler(async (req, res) => {
    if (!req.user?._id) {
        throw new ApiError(401, "Please login to write a review");
    }

    const { review, rating } = req.body;

    if (!review?.trim() || !rating) {
        throw new ApiError(400, "Review text and rating are required");
    }

    if (rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    const newReview = await Review.create({
        user: req.user._id,
        review,
        rating,
        status: "approved"
    });

    const populatedReview = await Review.findById(newReview._id)
        .populate("user", "username child_name avatar");

    return res.status(201).json(
        new ApiResponse(201, populatedReview, "Review submitted")
    );
});

const getAllReviews = asyncHandler(async (req, res) => {
    const { status = "approved", sort = "latest" } = req.query;
    
    const filter = { status };
    const sortOptions = {
        latest: { createdAt: -1 },
        oldest: { createdAt: 1 },
        highestRated: { rating: -1 },
        lowestRated: { rating: 1 }
    };

    const reviews = await Review.find(filter)
        .populate("user", "username child_name avatar")
        .sort(sortOptions[sort] || sortOptions.latest);

    return res.status(200).json(
        new ApiResponse(200, reviews, "Reviews fetched successfully")
    );
});

const updateReviewStatus = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { status } = req.body;

    if (!["approved", "rejected"].includes(status)) {
        throw new ApiError(400, "Invalid status");
    }

    const review = await Review.findByIdAndUpdate(
        reviewId,
        { status },
        { new: true }
    ).populate("user", "username child_name avatar");

    if (!review) {
        throw new ApiError(404, "Review not found");
    }

    return res.status(200).json(
        new ApiResponse(200, review, `Review ${status} successfully`)
    );
});

const editReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;
    const { review, rating } = req.body;

    if (!review?.trim() || !rating) {
        throw new ApiError(400, "Review text and rating are required");
    }

    if (rating < 1 || rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }

    const updatedReview = await Review.findOneAndUpdate(
        { _id: reviewId, user: req.user._id },
        {
            review,
            rating,
            status: "approved"
        },
        { new: true }
    ).populate("user", "username child_name avatar");

    if (!updatedReview) {
        throw new ApiError(404, "Review not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(200, updatedReview, "Review updated successfully")
    );
});

const deleteReview = asyncHandler(async (req, res) => {
    const { reviewId } = req.params;

    const deletedReview = await Review.findOneAndDelete({
        _id: reviewId,
        user: req.user._id
    });

    if (!deletedReview) {
        throw new ApiError(404, "Review not found or unauthorized");
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Review deleted successfully")
    );
});

const getUserReviews = asyncHandler(async (req, res) => {
    const reviews = await Review.find({ user: req.user._id })
        .populate("user", "username child_name avatar")
        .sort({ createdAt: -1 });

    return res.status(200).json(
        new ApiResponse(200, reviews, "User reviews fetched successfully")
    );
});

export {
    createReview,
    getAllReviews,
    updateReviewStatus,
    editReview,
    deleteReview,
    getUserReviews
};
