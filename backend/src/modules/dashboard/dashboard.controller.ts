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

  const userId = req.user?.userId;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }


  const dashboard = await prisma.dashboard.create({
    data: {
      name,
      workspaceId,
      members: {
        create: {
          userId: req?.user?.userId!,
          role: "owner",
        },
      },
    },
  });

  return successResponse(res, dashboard, "Dashboard created");
});

export const getDashboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
      include: {
        members: true,
      },
    });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: "Dashboard not found",
      });
    }

    const member = dashboard.members.find(
      (m) => m.userId === req?.user?.userId
    );

    const userRole = member?.role || "viewer";

    const activity = await prisma?.activityLog.findMany({
      where: { dashboardId: id },
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        user: {
          select: {
            email: true,
            name: true,
          },
        },
      },
    });
    return res.json({
      success: true,
      data: {
        id: dashboard.id,
        name: dashboard.name,
        layoutJson: dashboard.layoutJson,
        version: dashboard.version,
        role: userRole,
        activity
      },
    });
  }
);



export const updateDashboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const { layoutJson, version } = req.body;
    const userId = req.user?.userId;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const dashboard = await prisma.dashboard.findUnique({
      where: { id },
    });

    if (!dashboard) {
      return res.status(404).json({
        success: false,
        message: "Dashboard not found",
      });
    }

    // 🔒 Check membership
    const member = await prisma.dashboardMember.findUnique({
      where: {
        userId_dashboardId: {
          userId,
          dashboardId: id,
        },
      },
    });

    if (!member) {
      return res.status(403).json({
        success: false,
        message: "Access denied",
      });
    }

    if (member.role === "viewer") {
      return res.status(403).json({
        success: false,
        message: "Permission denied",
      });
    }

    // 🔁 Version conflict check
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


// export const getDashboardsByWorkspace = asyncHandler(
//   async (req: AuthRequest, res: Response) => {
//     const { workspaceId } = req.query;

//     const dashboards = await prisma.dashboard.findMany({
//       where: { workspaceId: workspaceId as string },
//     });

//     return successResponse(res, dashboards);
//   }
// );

export const getDashboards = asyncHandler(
  async (req: AuthRequest, res: Response) => {

    const dashboards = await prisma.dashboard.findMany({
      where: {
        members: {
          some: {
            userId: req?.user?.userId,
          },
        },
      },
      include: {
        members: true,
      },
    });

    return res.json({
      success: true,
      data: dashboards,
    });
  }
);

export const renameDashboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const { name } = req.body;

    const updated = await prisma.dashboard.update({
      where: { id },
      data: { name },
    });

    return successResponse(res, updated);
  }
);

export const deleteDashboard = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;

    await prisma.dashboard.delete({
      where: { id },
    });

    return successResponse(res, null, "Deleted");
  }
);

export const inviteUser = asyncHandler(
  async (req: AuthRequest, res: Response) => {
    const id = req.params.id as string;
    const { email, role } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const existingMember =
      await prisma.dashboardMember.findUnique({
        where: {
          userId_dashboardId: {
            userId: user.id,
            dashboardId: id,
          },
        },
      });

    if (existingMember) {
      // Update role instead of failing
      await prisma.dashboardMember.update({
        where: {
          userId_dashboardId: {
            userId: user.id,
            dashboardId: id,
          },
        },
        data: {
          role,
        },
      });

      return res.json({
        success: true,
        message: "User role updated",
      });
    }

    await prisma.dashboardMember.create({
      data: {
        userId: user.id,
        dashboardId: id,
        role,
      },
    });

    return res.json({
      success: true,
      message: "User invited successfully",
    });
  }
);

