import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.models.js";
import { Subscription } from "../models/subscription.models.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { v2 as cloudinary } from "cloudinary";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import crypto from "crypto";

const generateAccessAndRefreshTokens = async(userId) => {
    try {
        const user = await User.findById(userId)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()

        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating access and refresh tokens")
    }
} 

const addDays = (date, days) => {
    const d = new Date(date);
    d.setDate(d.getDate() + days);
    return d;
};

const registerUser = asyncHandler( async ( req, res ) => {
    const { 
        username, 
        email, 
        password, 
        child_name, 
        school_name,
        bio,
        phone,
        dob,
        standard 
    } = req.body

    if(!username || !email || !password || !child_name || !school_name || !dob || !standard){
        throw new ApiError(400, "Username, email, password, child's name, school's name, date of birth and standard are required")
    }

    const existingUser1 = await User.findOne({
        $or: [{ username }]
    })
    if(existingUser1){
        throw new ApiError(409, "User with username already exists")
    }

    const existingUser2 = await User.findOne({
        $or: [{ email }]
    })
    if(existingUser2){
        throw new ApiError(409, "User with email already exists")
    }

    let avatarUrl = undefined;
    if(req.file?.path){
        const avatar = await uploadOnCloudinary(req.file.path);
        if(avatar) {
            avatarUrl = avatar.url;
        }
    }

    const user = await User.create({
        username: username.toLowerCase(),
        email,
        password,
        child_name,
        school_name,
        bio: bio || "",
        avatar: avatarUrl,
        phone: phone || "",
        dob,
        standard,
        isEmailVerified: false,
        verificationToken: null
    })

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken -verificationToken"
    )

    if(!createdUser){
        throw new ApiError(500, "Registration failed")
    }

    return res
    .status(201)
    .json(new ApiResponse(200, createdUser, "Registration successful"))
})

const loginUser = asyncHandler( async ( req, res ) => {
    const { email, username, password } = req.body

    if(!(username || email)){
        throw new ApiError(400, "Username or Email is required")
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials");
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -verificationToken");

    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, { user: loggedInUser, accessToken, refreshToken }, "Login successful")
    )
})

const logoutUser = asyncHandler( async ( req, res ) => {

    User.findByIdAndUpdate(
        req.user._id,
        {
            $unset: {
                refreshToken: 1
            },
        },
        {
            new: true
        }
    )
    
    const options = {
        httpOnly: true,
        secure: true
    }
    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            {},
            "User Logout Successful"
        )
    )
})

const refreshAccessToken = asyncHandler( async ( req, res ) => {

    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(401, "Unauthorized request")
    }
    try {
        const decodedToken = jwt.verify(
            incomingRefreshToken,
            process.env.REFRESH_TOKEN_SECRET
        )
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(401, "Invalid Refresh Token")
        }
        if(incomingRefreshToken !== user?.refreshToken){
            throw new ApiError(401, "Refresh token is expired or used")
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newrefreshToken } = await generateAccessAndRefreshTokens(user._id)
        return res
        .status(200)
        .cookie("accessToken", accessToken, options)
        .cookie("refreshToken", newrefreshToken, options)
        .json(
            new ApiResponse(
                200,
                {accessToken, refreshToken: newrefreshToken},
                "Access Token refreshed successfully"
            )
        )
    } catch (error) {
        throw new ApiError(401, error?.message || "Invalid refresh token");
    }
})

const changeCurrentPassword = asyncHandler( async ( req, res ) => {

    const { oldPassword, newPassword, confirmPassword } = req.body

    if(!(oldPassword && newPassword && confirmPassword)){
        throw new ApiError(400, "All password fields are required")
    }

    if(!(newPassword === confirmPassword)){
        throw new ApiError(400, "New Password and Confirm Password do not match")
    }

    const user = await User.findById(req.user?._id)

    const isPassCorrect = await user.isPasswordCorrect(oldPassword)
    if(!isPassCorrect){
        throw new ApiError(400, "Invalid Old Password")
    }

    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    )
})

const forgotPassword = asyncHandler( async ( req, res ) => {

    const { identifier } = req.body;

    if(!identifier){
        throw new ApiError(400, "Email or Username is required")
    }

    const user = await User.findOne(
        {
            $or: [
                { email: identifier },
                { username: identifier }
            ],
        }
    );

    if(!user){
        throw new ApiError(404, "User not found");
    }

    const newPassword = Math.random().toString(36).slice(-8);
    console.log(newPassword);

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const emailContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #333; margin: 0;">Password Reset</h1>
            </div>
            <p>Dear ${user?.child_name},</p>
            <p>A password reset was requested for your account. Here is your temporary password:</p>
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 20px 0; text-align: center;">
                <code style="font-size: 20px; color: #2c3e50; font-weight: bold;">${newPassword}</code>
            </div>
            <p style="color: #e74c3c; margin-bottom: 20px;">For security reasons, please change this password immediately after logging in.</p>
            <p style="margin-bottom: 25px;">If you did not request this password reset, please contact our support team immediately.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">This is an automated message. Please do not reply to this email.</p>
        </div>
    `;

    await transporter.sendMail({
        from: '"Support Team" <no-reply@support.com>',
        to: user?.email,
        subject: "Password Reset Request",
        html: emailContent,
    });

    user.password = newPassword;
    await user.save({validateBeforeSave: false})

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Password changed successfully"
        )
    )
})

const getCurrentUser = asyncHandler(async ( req, res ) => {

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            req.user, 
            "Current user fetched successfully"
        )
    )
})

const updateAccountDetails = asyncHandler( async ( req, res ) => {
    const { 
        username,
        email, 
        child_name,
        school_name,
        bio,
        phone,
        dob,
        standard 
    } = req.body;
    
    const updates = {};

    // Handle email update for subscribed users
    if(email) {
        const currentUser = await User.findById(req.user?._id);
        if(currentUser.isSubscribed) {
            // Update email in subscription collection
            await Subscription.findOneAndUpdate(
                { email: currentUser.email },
                { email: email },
                { new: true }
            );
        }
        updates.email = email;
    }

    // Handle other updates
    if(username) updates.username = username;
    if(child_name) updates.child_name = child_name;
    if(school_name) updates.school_name = school_name;
    if(bio) updates.bio = bio;
    if(phone) updates.phone = phone;
    if(dob) updates.dob = dob;
    if(standard) updates.standard = standard;

    if(req.file?.path){
        const avatar = await uploadOnCloudinary(req.file?.path);
        if(!avatar.url){
            throw new ApiError(400, "Avatar upload failed");
        }
        const oldAvatar = req.user?.avatar?.split('/').pop().split('.')[0]
        if(oldAvatar){
            const deletedAvatar = await cloudinary.uploader.destroy(oldAvatar, {resource_type: 'image', invalidate: true})
            console.log("Old avatar deleted? ", deletedAvatar)
        }
        updates.avatar = avatar.url;
    }

    const user = await User.findByIdAndUpdate(
        req.user?._id,
        { $set: updates },
        { new: true }
    ).select("-password -refreshToken -verificationToken");

    if(!user){
        throw new ApiError(404, "Update failed")
    }

    return res
    .status(200)
    .json(new ApiResponse(200, user, "Profile updated successfully"))
})

const getUserProfile = asyncHandler( async ( req, res ) => {

    const { userId } = req.query;

    if(!userId){
        throw new ApiError(400, "User ID is required");
    }

    const user = await User.findById(userId).select("-password -isEmailVerified -friends -refreshToken -verificationToken");

    if(!user){
        throw new ApiError(404, "User not found or email not verified");
    }

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            user,
            "User profile fetched successfully"
        )
    );
})

const sendVerificationEmail = asyncHandler( async ( req, res ) => {

    const { username } = req.params

    if(!username || username.trim() === ""){
        throw new ApiError(400, "Username is required")
    }

    const user = await User.findOne({
        username
    });

    if(!user){
        throw new ApiError(400, "User is required")
    }

    const verificationToken = jwt.sign(
        {
            email: user.email
        },
        process.env.VERIFICATION_TOKEN_SECRET,
        {
            expiresIn: "1d"
        }
    );

    const updatedUser = await User.findByIdAndUpdate(
        user._id,
        { 
            $set: {
                verificationToken: verificationToken
            }
        },
        { 
            new: true
        }
    );
    
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email/${verificationToken}`;

    const transporter = nodemailer.createTransport({
        service: "Gmail",
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD,
        },
    });

    const emailContent = `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
            <div style="text-align: center; margin-bottom: 30px;">
                <h1 style="color: #333; margin: 0;">Email Verification</h1>
            </div>
            <p>Dear ${user?.child_name},</p>
            <p>Thank you for creating an account. To ensure the security of your account and activate all features, please verify your email address.</p>
            <div style="text-align: center; margin: 30px 0;">
                <a href="${verificationLink}" style="background-color: #2c3e50; color: white; text-decoration: none; padding: 12px 30px; border-radius: 5px; font-weight: bold;">Verify Email Address</a>
            </div>
            <p style="color: #666;">If the button above doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; color: #2c3e50;"><small>${verificationLink}</small></p>
            <p style="margin-top: 25px;">This verification link will expire in 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
            <p style="color: #999; font-size: 12px; text-align: center;">This is an automated message. Please do not reply to this email.</p>
        </div>
    `;
    
    await transporter.sendMail({
        from: '"Support Team" <no-reply@support.com>',
        to: user?.email,
        subject: "Verify Your Email",
        html: emailContent,
    });

    return res
    .status(200)
    .json(
        new ApiResponse(
            200,
            {},
            "Verification Email sent successfully"
        )
    )

})

const verifyEmail = asyncHandler( async ( req, res ) => {

    const { token } = req.query;

    if(!token){
        throw new ApiError(400, "Verification token is required")
    }

    try{
        const decodedUser = jwt.verify(token, process.env.VERIFICATION_TOKEN_SECRET);
        const user = await User.findOne({ email: decodedUser.email });
    
        if(!user){
            throw new ApiError(404, "User not found");
        }
    
        if(user.isEmailVerified){
            return res
            .status(200)
            .json(
                new ApiResponse(
                    200,
                    {},
                    "Email is already verified"
                )
            );
        }
    
        user.isEmailVerified = true;
        user.verificationToken = null;
        await user.save();

        const transporter = nodemailer.createTransport({
            service: "Gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD,
            },
        });
    
        const emailContent = `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e0e0e0; border-radius: 8px;">
                <div style="text-align: center; margin-bottom: 30px;">
                    <h1 style="color: #333; margin: 0;">Email Verified Successfully</h1>
                </div>
                <p>Dear ${user.child_name},</p>
                <p>Your email address has been successfully verified. Your account is now fully activated.</p>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 25px 0;">
                    <h3 style="color: #2c3e50; margin: 0 0 10px 0;">Next Steps:</h3>
                    <ul style="color: #666; margin: 0; padding-left: 20px;">
                        <li>Complete your profile information</li>
                        <li>Explore our educational resources</li>
                        <li>Connect with other students</li>
                    </ul>
                </div>
                <p>If you have any questions, our support team is here to help.</p>
                <hr style="border: none; border-top: 1px solid #eee; margin: 25px 0;" />
                <p style="color: #999; font-size: 12px; text-align: center;">This is an automated message. Please do not reply to this email.</p>
            </div>
        `;
        await transporter.sendMail({
            from: '"Support Team" <no-reply@support.com>',
            to: user.email,
            subject: "Email Verified Successfully",
            html: emailContent,
        });
    
        return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {},
                "Email has been verified successfully"
            )
        );
    } catch(error){
        throw new ApiError(401, "Invalid or expired verification token");
    }
})

const loginSoftware = asyncHandler( async ( req, res ) => {
    const { email, username, password, deviceId } = req.body

    if (!(username || email)) {
        throw new ApiError(400, "Username or Email is required");
    }

    if (!password) {
        throw new ApiError(400, "Password is required");
    }
    if (!deviceId) {
        throw new ApiError(400, "deviceId is required for software login");
    }

    const user = await User.findOne({
        $or: [{username}, {email}]
    })
    if(!user){
        throw new ApiError(404, "User does not exist");
    }

    const isPasswordValid = await user.isPasswordCorrect(password)
    if(!isPasswordValid){
        throw new ApiError(401, "Invalid credentials");
    }

    const now = new Date();
    const hasActive = user.softwareSessionActive === true && user.softwareSessionExpiresAt && user.softwareSessionExpiresAt > now;

    if (hasActive) {
        if (user.softwareSessionDeviceId && (user.softwareSessionDeviceId === deviceId || user.softwareSessionDeviceId.trim() === "")) {
            user.lastSoftwareLoginAt = now;
            user.softwareSessionActive = true;
            user.softwareSessionDeviceId = deviceId;
            user.softwareSessionExpiresAt = addDays(now, 30);
            await user.save({ validateBeforeSave: false });
        } else {
            throw new ApiError(409, "Active software session exists on another device. Try after it expires or logout from that device.");
        }
    } else {
        user.lastSoftwareLoginAt = now;
        user.softwareSessionActive = true;
        user.softwareSessionDeviceId = deviceId;
        user.softwareSessionExpiresAt = addDays(now, 30);
        await user.save({ validateBeforeSave: false });
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user._id);

    const loggedInUser = await User.findById(user._id).select("-password -refreshToken -verificationToken");

    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .json(
        new ApiResponse(200, {
            user: loggedInUser,
            accessToken,
            refreshToken,
            lastSoftwareLoginAt: user.lastSoftwareLoginAt,
            softwareSessionActive: user.softwareSessionActive,
            softwareSessionExpiresAt: user.softwareSessionExpiresAt,
            softwareSessionDeviceId: user.softwareSessionDeviceId,
        }, "Login successful")
    )
})

const logoutSoftware = asyncHandler( async ( req, res ) => {

    const userId = req.user?._id;
    if (!userId) {
        throw new ApiError(401, "Unauthorized request");
    }

    const user = await User.findById(userId);
    if (!user) {
        throw new ApiError(404, "User not found");
    }

    console.log("Succesful");

    user.softwareSessionActive = false;
    user.softwareSessionDeviceId = null;
    user.softwareSessionExpiresAt = null;
    await user.save({ validateBeforeSave: false });
    
    const options = {
        httpOnly: true,
        secure: true
    }

    return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(
        new ApiResponse(
            200,
            {},
            "Software Logout Successful"
        )
    )
})

export { registerUser , loginUser, logoutUser, loginSoftware, logoutSoftware, refreshAccessToken, changeCurrentPassword, forgotPassword, getCurrentUser, updateAccountDetails, getUserProfile, sendVerificationEmail, verifyEmail }