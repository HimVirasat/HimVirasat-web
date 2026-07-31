import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import crypto from "node:crypto";

// import authRoutes from "./routes/auth.routes.js";
// import userRoutes from "./routes/user.routes.js";
// import dashboardRoutes from "./routes/dashboard.routes.js";
// import dataLookupRoutes from "./routes/datalookup.routes.js";
// import reviewQueueRoutes from "./routes/reviewqueue.routes.js";
// import submissionRoutes from "./routes/submission.routes.js";
import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
export const app = express();

app.use(cookieParser());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use((req, res, next) => {
  const requestId = req.get("x-request-id") || crypto.randomUUID();
  res.locals.requestId = requestId;
  res.setHeader("x-request-id", requestId);

  const startedAt = performance.now();
  res.on("finish", () => {
    logger.info("request completed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Number((performance.now() - startedAt).toFixed(2)),
      userId: (req as { user?: { id?: string } }).user?.id,
    });
  });

  next();
});
app.use(morgan("dev"));

const allowedOrigins = [
  "http://localhost:3000",
  "https://him-virasat.vercel.app",
  env.FRONTEND_URL,
].filter((origin): origin is string => Boolean(origin));
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  }),
);
app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    message: "Hello from HimVirasat Backend!",
  });
});
app.get("/", (_, res) => {
  res.send("Backend is running");
});

import { authRouter } from "./modules/auth/index.js";
import { usersRouter } from "./modules/users/index.js";
import { submissionsRouter } from "./modules/submissions/index.js";
import reviewqueueRouter from "./modules/reviewqueue/reviewqueue.routes.js";
import datalookupRouter from "./modules/datalookup/datalookup.routes.js";
import { dashboardRouter } from "./modules/dashboard/index.js";
import {datasetsRouter} from "./modules/datasets/index.js"
// const app = express();
app.use(express.json());
app.use(cookieParser());

app.use("/auth", authRouter);
app.use("/users", usersRouter);
app.use("/submissions", submissionsRouter);
app.use("/reviewqueue", reviewqueueRouter);
app.use("/datalookup", datalookupRouter);
app.use("/dashboard", dashboardRouter);
app.use("/datasets", datasetsRouter);
export default app;
