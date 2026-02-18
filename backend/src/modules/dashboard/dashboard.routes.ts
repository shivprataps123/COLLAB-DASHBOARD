import { Router } from "express";
import {
  createDashboard,
  getDashboard,
  updateDashboard,
  getDashboardsByWorkspace,
} from "./dashboard.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createDashboard);

// IMPORTANT: query route BEFORE :id route
router.get("/", authMiddleware, getDashboardsByWorkspace);

router.get("/:id", authMiddleware, getDashboard);

router.put("/:id", authMiddleware, updateDashboard);

export default router;
