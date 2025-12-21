import { Router } from "express";
import { subscribe, verifySubscription, unsubscribe, getSubscribers, getStats } from "../controllers/subscription.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/subscribe").post(subscribe);

router.route("/verify").post(verifySubscription);

router.route("/unsubscribe").post(verifyJWT, unsubscribe);

router.route("/subscribers").get(verifyJWT, getSubscribers);

router.route("/stats").get(verifyJWT, getStats);

export default router;
