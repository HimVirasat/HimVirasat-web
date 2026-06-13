import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import { supabase } from "./services/supabase.js";

export const app = express();

app.use(helmet());

app.use(cors());

app.use(compression());

app.use(express.json());

app.use(morgan("dev"));

app.get("/health", (_, res) => {
  res.json({
    status: "ok",
    message: "Hello from HimVirasat Backend!"
  });
});