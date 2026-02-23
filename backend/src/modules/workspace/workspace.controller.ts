import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { successResponse } from "../../utils/apiResponse";

export const createWorkspace = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: req.body.name,
        ownerId: userId,
      },
    });

    return successResponse(res, workspace, "Workspace created");
  }
);

export const getWorkspaces = asyncHandler(async (
  req: AuthRequest,
  res: Response
) => {
  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: req.user?.userId },
  });

  return successResponse(res, workspaces, "Workspace retrieved");

});
