import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { successResponse } from "../../utils/apiResponse";

export const createWorkspace = asyncHandler(async (
  req: AuthRequest,
  res: Response
) => {
  const { name } = req.body;

  const workspace = await prisma.workspace.create({
    data: {
      name,
      ownerId: req.userId!,
    },
  });

  return successResponse(res, workspace, "Workspace created");

});

export const getWorkspaces = asyncHandler(async (
  req: AuthRequest,
  res: Response
) => {
  const workspaces = await prisma.workspace.findMany({
    where: { ownerId: req.userId },
  });

    return successResponse(res, workspaces, "Workspace retrieved");

});
