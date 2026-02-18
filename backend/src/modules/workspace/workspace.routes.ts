import { Router } from "express";
import { createWorkspace, getWorkspaces } from "./workspace.controller";
import { authMiddleware } from "../../middleware/auth.middleware";

const router = Router();

router.post("/", authMiddleware, createWorkspace);
router.get("/", authMiddleware, getWorkspaces);

export default router;
