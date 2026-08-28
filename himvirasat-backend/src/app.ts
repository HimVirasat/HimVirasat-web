import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import crypto from "node:crypto";

import { env } from "./config/env.js";
import { logger } from "./utils/logger.js";
import { authController } from "./modules/auth/auth.controller.js";
import { modules } from "./modules/registry.js";
import {
  errorHandler,
  notFoundHandler,
} from "./middlewares/error.middleware.js";
import { rateLimiter } from "./middlewares/rate-limiter.middleware.js";

export const app = express();

app.use(cookieParser());
app.use(helmet());
app.use(compression());

// Clerk webhook must consume the raw body before express.json()
app.post(
  "/auth/webhooks/clerk",
  express.raw({ type: "application/json" }),
  authController.clerkWebhook,
);

app.use(express.json());

// Request logging + request-id propagation
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

// Global rate limiting (generous defaults to avoid breaking existing traffic)
app.use(
  rateLimiter({ windowMs: 60 * 1000, max: 600 }),
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

// Mount feature routers under /api/v1 (versioned, preferred for new code) AND
// keep them mounted at the root for backward compatibility with existing
// frontend calls.
for (const { path, router } of modules) {
  app.use(`/api/v1${path}`, router);
}
for (const { path, router } of modules) {
  app.use(path, router);
}

// 404 + global error handling (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

export default app;
