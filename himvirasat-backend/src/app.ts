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
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    message: "Hello from HimVirasat Backend!",
  });
});

app.use("/auth", authRoutes);
app.use("/users", userRoutes);
