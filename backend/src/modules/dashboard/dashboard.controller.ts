import { Response } from "express";
import { prisma } from "../../config/prisma";
import { AuthRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../utils/asyncHandler";
import { successResponse } from "../../utils/apiResponse";

export const createDashboard = asyncHandler(async (
  req: AuthRequest,
  res: Response
) => {
  const { name, workspaceId } = req.body;

  const dashboard = await prisma.dashboard.create({
    data: {
      name,
      workspaceId,
    },
  });

  return successResponse(res, dashboard, "Dashboard created");
});

export const getDashboard = asyncHandler(async (
  req: AuthRequest,
  res: Response
) => {
  const id = req.params.id as string;


  const dashboard = await prisma.dashboard.findUnique({
    where: { id },
  });

  return successResponse(res, dashboard, "Dashboard retrieved");

});

export const updateDashboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const { layoutJson, version } = req.body;

    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
    });

    if (!dashboard) {
      const error = new Error("Dashboard not found");
      (error as any).statusCode = 404;
      throw error;
    }

    if (version !== dashboard.version) {
      return res.status(409).json({
        success: false,
        message: "Version conflict",
        currentVersion: dashboard.version,
      });
    }

    const updated = await prisma.dashboard.update({
      where: { id },
      data: {
        layoutJson,
        version: dashboard.version + 1,
      },
    });

    return successResponse(res, updated, "Updated");
  }
);

export const getDashboardsByWorkspace = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const { workspaceId } = req.query;

    const dashboards = await prisma.dashboard.findMany({
      where: { workspaceId: workspaceId as string },
    });

    return successResponse(res, dashboards);
  }
);

