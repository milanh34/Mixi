import { Router } from "express";
import { createReview, getAllReviews, updateReviewStatus, editReview, deleteReview, getUserReviews } from "../controllers/review.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/create").post(verifyJWT, createReview);

router.route("/all").get(getAllReviews);

router.route("/user").get(verifyJWT, getUserReviews);

router.route("/status/:reviewId").patch(verifyJWT, updateReviewStatus);

router.route("/edit/:reviewId").patch(verifyJWT, editReview);

router.route("/delete/:reviewId").delete(verifyJWT, deleteReview);

export default router;
