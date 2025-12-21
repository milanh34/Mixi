import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true
}))

app.use(express.json({
    limit: "16kb"
}))

app.use(express.urlencoded({
    extended: true,
    limit: "16kb"
}))

app.use(express.static("public"))

app.use(cookieParser())

// import routes
import userRouter from "./routes/user.routes.js";
import subscriptionRouter from "./routes/subscription.routes.js";
import reviewRouter from "./routes/review.routes.js";
import healthRouter from "./routes/health.routes.js";

// declare routes
app.use("/api/v1/users", userRouter);
app.use("/api/v1/subscriptions", subscriptionRouter);
app.use("/api/v1/reviews", reviewRouter);
app.use("/api/v1/health", healthRouter);

if (process.env.RENDER === "true") {
    setInterval(() => {
        fetch(`${process.env.HEALTH_URL || "http://localhost:8000/api/v1/health"}`)
            .then(res => res.json())
            .then(data => {
                console.log("Health ping:", data);
            })
            .catch(err => {
                console.error("Health ping failed:", err);
            });
    }, 10 * 60 * 1000);
}

export { app }