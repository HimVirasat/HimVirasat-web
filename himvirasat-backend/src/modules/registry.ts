import { Router } from "express";
import { authRouter } from "./auth/index.js";
import { usersRouter } from "./users/index.js";
import { submissionsRouter } from "./submissions/index.js";
import reviewqueueRouter from "./reviewqueue/reviewqueue.routes.js";
import datalookupRouter from "./datalookup/datalookup.routes.js";
import { dashboardRouter } from "./dashboard/index.js";
import { datasetsRouter } from "./datasets/index.js";

export interface ModuleDefinition {
  path: string;
  router: Router;
}

export const modules: ModuleDefinition[] = [
  { path: "/auth", router: authRouter },
  { path: "/users", router: usersRouter },
  { path: "/submissions", router: submissionsRouter },
  { path: "/reviewqueue", router: reviewqueueRouter },
  { path: "/datalookup", router: datalookupRouter },
  { path: "/dashboard", router: dashboardRouter },
  { path: "/datasets", router: datasetsRouter },
];
