import { Router } from "express";
import { changeCurrentPassword, forgotPassword, getCurrentUser, getUserProfile, loginSoftware, loginUser, logoutSoftware, logoutUser, refreshAccessToken, registerUser, sendVerificationEmail, updateAccountDetails, verifyEmail } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router.route("/register").post(upload.single("avatar"), registerUser);

router.route("/login").post(loginUser);

router.route("/logout").post(verifyJWT ,logoutUser);

router.post("/login/software", loginSoftware);

router.post("/logout/software", verifyJWT, logoutSoftware);

router.route("/refresh-token").post(refreshAccessToken);

router.route("/change-password").post(verifyJWT, changeCurrentPassword);

router.route("/forgot-password").post(forgotPassword);

router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/update-details").post(verifyJWT, upload.single("avatar"), updateAccountDetails);

router.route("/profile").get(verifyJWT, getUserProfile);

router.route("/send-verification-email/:username").get(sendVerificationEmail);

router.route("/verify-email").post(verifyEmail);

export default router;
