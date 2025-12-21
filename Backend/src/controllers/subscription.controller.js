import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.models.js";
import { User } from "../models/user.models.js";
import nodemailer from "nodemailer";

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString();
const otpStorage = new Map();

const subscribe = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const existingSubscription = await Subscription.findOne({ email });
    if (existingSubscription && existingSubscription.status === "active") {
        throw new ApiError(409, "Email already subscribed");
    }

    const user = await User.findOne({ email });
    if (user?.isEmailVerified) {
        if (existingSubscription && existingSubscription.status === "unsubscribed") {
            existingSubscription.status = "active";
            existingSubscription.subscriptionDate = new Date();
            await existingSubscription.save();
        } else {
            await Subscription.create({
                email,
                status: "active",
                subscriptionDate: new Date()
            });
        }

        if (user) {
            user.isSubscribed = true;
            await user.save();
        }

        return res.status(201).json(
            new ApiResponse(201, { email }, "Subscribed successfully")
        );
    }

    const otp = generateOTP();
    otpStorage.set(email, otp);

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const emailContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <h1 style="color: #333; text-align: center;">Verify Your Subscription</h1>
            <p>Your verification code is:</p>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 24px; font-weight: bold;">
                ${otp}
            </div>
            <p>This code will expire in 10 minutes.</p>
        </div>
    `;

    await transporter.sendMail({
        from: '"Support Team" <no-reply@support.com>',
        to: email,
        subject: "Verify Your Subscription",
        html: emailContent,
    });

    return res.status(200).json(
        new ApiResponse(200, {}, "Verification code sent")
    );
});

const verifySubscription = asyncHandler(async (req, res) => {
    const { email, otp } = req.body;

    if (!email || !otp) {
        throw new ApiError(400, "Email and OTP are required");
    }

    const storedOTP = otpStorage.get(email);
    if (!storedOTP || storedOTP !== otp) {
        throw new ApiError(400, "Invalid or expired OTP");
    }

    otpStorage.delete(email);

    const existingSubscription = await Subscription.findOne({ email });

    if (existingSubscription && existingSubscription.status === "unsubscribed") {
        existingSubscription.status = "active";
        existingSubscription.subscriptionDate = new Date();
        await existingSubscription.save();
        return res.status(200).json(
            new ApiResponse(200, existingSubscription, "Subscription reactivated successfully")
        );
    }
    const subscription = await Subscription.create({
        email,
        status: "active",
        subscriptionDate: new Date(),
    });

    const user = await User.findOne({ email });
    if (user) {
        user.isSubscribed = true;
        await user.save();
    }

    return res.status(201).json(
        new ApiResponse(201, subscription, "Subscription verified successfully")
    );
});

const unsubscribe = asyncHandler(async (req, res) => {
    const { email } = req.body;

    if (!email) {
        throw new ApiError(400, "Email is required");
    }

    const subscription = await Subscription.findOne({ email });
    if (!subscription) {
        throw new ApiError(404, "Subscription not found");
    }

    subscription.status = "unsubscribed";
    subscription.unsubscribeDate = new Date();
    await subscription.save();

    const user = await User.findOne({ email });
    if (user) {
        user.isSubscribed = false;
        await user.save();
    }

    return res.status(200).json(
        new ApiResponse(200, {}, "Unsubscribed successfully")
    );
});

const getSubscribers = asyncHandler(async (req, res) => {
    const subscribers = await Subscription.find({ status: "active" })
        .select("email subscriptionDate lastEmailSent")
        .sort({ subscriptionDate: -1 });

    return res.status(200).json(
        new ApiResponse(200, subscribers, "Subscribers fetched successfully")
    );
});

const getStats = asyncHandler(async (req, res) => {
    const stats = await Subscription.aggregate([
        {
            $group: {
                _id: "$status",
                count: { $sum: 1 }
            }
        }
    ]);

    const totalActive = stats.find(s => s._id === "active")?.count || 0;
    const totalUnsubscribed = stats.find(s => s._id === "unsubscribed")?.count || 0;

    return res.status(200).json(
        new ApiResponse(200, { totalActive, totalUnsubscribed }, "Stats fetched successfully")
    );
});

export {
    subscribe,
    verifySubscription,
    unsubscribe,
    getSubscribers,
    getStats
};
