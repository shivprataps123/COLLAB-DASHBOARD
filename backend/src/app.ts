import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./modules/auth/auth.routes";
import workspaceRoutes from "./modules/workspace/workspace.routes";
import dashboardRoutes from "./modules/dashboard/dashboard.routes";
import { errorMiddleware } from "./middleware/error.middleware";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/workspace", workspaceRoutes);
app.use("/dashboard", dashboardRoutes);

app.use(errorMiddleware);

export default app;
