import { Server } from "socket.io";
import { prisma } from "./config/prisma";
import jwt from "jsonwebtoken";

let io: Server;


export const initSocket = (server: any) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:3000",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    const dashboardUsers: Record<string, Set<string>> = {};

    socket.on("join_dashboard", (dashboardId: string) => {
      socket.join(dashboardId);

      if (!dashboardUsers[dashboardId]) {
        dashboardUsers[dashboardId] = new Set();
      }

      dashboardUsers[dashboardId].add(socket.id);

      io.to(dashboardId).emit(
        "presence_update",
        Array.from(dashboardUsers[dashboardId])
      );
    });

    socket.on("editing_widget", ({ dashboardId, widgetId }) => {
      socket.to(dashboardId).emit("editing_widget", {
        widgetId,
        editor: socket.id,
      });
    });

    socket.on("lock_widget", ({ dashboardId, widgetId }) => {
      socket.to(dashboardId).emit("lock_widget", {
        widgetId,
        locker: socket.id,
      });
    });

    socket.on("unlock_widget", ({ dashboardId, widgetId }) => {
      socket.to(dashboardId).emit("unlock_widget", {
        widgetId,
      });
    });

    socket.on("disconnect", () => {
      for (const dashboardId in dashboardUsers) {
        dashboardUsers[dashboardId].delete(socket.id);

        io.to(dashboardId).emit(
          "presence_update",
          Array.from(dashboardUsers[dashboardId])
        );
      }
    });


    socket.on("layout_update", ({ dashboardId, layout, sender }) => {
      socket.to(dashboardId).emit("layout_update", {
        layout,
        sender,
      });
    });

    socket.on("activity_event", async ({ dashboardId, action }) => {

      const saved = await prisma.activityLog.create({
        data: {
          dashboardId,
          userId: socket.data.userId,
          action,
        },
        include: {
          user: {
            select: {
              email: true,
              name: true,
            },
          },
        },
      });

      io.to(dashboardId).emit("activity_event", saved);
    });


    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error("Unauthorized"));
      }

      const decoded: any = jwt.verify(
        token,
        process.env.JWT_SECRET!
      );

      socket.data.userId = decoded.userId;

      next();
    } catch (err) {
      next(new Error("Unauthorized"));
    }
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};
