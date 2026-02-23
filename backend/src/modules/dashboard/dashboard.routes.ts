import { Router } from "express";
import {
  createDashboard,
  getDashboard,
  updateDashboard,
  // getDashboardsByWorkspace,
  deleteDashboard,
  renameDashboard,
  inviteUser,
  getDashboards,
} from "./dashboard.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createDashboard);

// IMPORTANT: query route BEFORE :id route
router.get("/", authMiddleware, getDashboards);

router.get("/:id", authMiddleware, getDashboard);

router.put("/:id", authMiddleware, updateDashboard);

router.put("/:id/rename", authMiddleware, renameDashboard);
router.delete("/:id", authMiddleware, deleteDashboard);
router.post("/:id/invite", authMiddleware, inviteUser);

export default router;
