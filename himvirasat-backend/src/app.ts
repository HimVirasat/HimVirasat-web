import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
export const app = express();

app.use(cookieParser());
app.use(helmet());
app.use(compression());
app.use(express.json());
app.use(morgan("dev"));

const allowedOrigins = [
  "http://localhost:3000",
  "https://him-virasat.vercel.app",
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

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
