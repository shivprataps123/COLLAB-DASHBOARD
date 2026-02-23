"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import GridLayout from "react-grid-layout";
import { getDashboard, updateDashboard } from "@/src/modules/dashboard/api";
import { debounce } from "lodash";
import WidgetContainer from "../components/WidgetContainer";
import { socket } from "@/src/services/socket";
import WidgetConfigPanel from "../components/WidgetConfigPanel";
import ActivityPanel from "../components/ActivityPanel";
import api from "@/src/services/axios";

export default function DashboardPage() {
  const params = useParams();
  const id = params.id as string;

  const versionRef = useRef(0);

  const [history, setHistory] = useState<{
    past: any[];
    present: any[];
    future: any[];
  }>({
    past: [],
    present: [],
    future: [],
  });

  const widgets = history.present || [];

  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [editingWidgets, setEditingWidgets] = useState<
    Record<string, string>
  >({});
  const [lockedWidgets, setLockedWidgets] = useState<
    Record<string, string>
  >({});
  const [selectedWidget, setSelectedWidget] = useState<any>(null);
  const [activityLog, setActivityLog] = useState<any[]>([]);
  const [showActivity, setShowActivity] = useState(false);
  const [role, setRole] = useState<"owner" | "editor" | "viewer">("owner");

  /* ---------------------- HISTORY ---------------------- */

  const setWithHistory = (newState: any[]) => {
    setHistory((prev) => ({
      past: [...prev.past, prev.present],
      present: newState,
      future: [],
    }));
  };

  const undo = () => {
    setHistory((prev) => {
      if (prev.past.length === 0) return prev;

      const previous = prev.past[prev.past.length - 1];
      const newPast = prev.past.slice(0, -1);

      const updated = {
        past: newPast,
        present: previous,
        future: [prev.present, ...prev.future],
      };

      broadcastChange(previous);
      logActivity("Undo action");

      return updated;
    });
  };

  const redo = () => {
    setHistory((prev) => {
      if (prev.future.length === 0) return prev;

      const next = prev.future[0];
      const newFuture = prev.future.slice(1);

      const updated = {
        past: [...prev.past, prev.present],
        present: next,
        future: newFuture,
      };

      broadcastChange(next);
      logActivity("Redo action");

      return updated;
    });
  };


  const handleInvite = async () => {
    const email = prompt("Enter user email");
    const role = prompt("Enter role: owner/editor/viewer");

    if (!email || !role) return;

    try {
      await api.post(`/dashboard/${id}/invite`, {
        email,
        role,
      });

      alert("User invited successfully");
    } catch (error) {
      console.error("Invite failed");
    }
  };

  /* ---------------------- ACTIVITY ---------------------- */

  const logActivity = (action: string) => {
    const entry = {
      user: socket.id || "You",
      action,
      timestamp: Date.now(),
    };

    // setActivityLog((prev) => [entry, ...prev]);

    socket.emit("activity_event", {
      dashboardId: id,
      action: "Moved widget",
    });
  };

  /* ---------------------- SOCKET ---------------------- */

  useEffect(() => {
    if (loading) return;

    socket.connect();
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);

      socket.emit("join_dashboard", id);
    });

    socket.on("layout_update", (data) => {
      console.log("CLIENT RECEIVED layout_update:", data);

      const { layout, sender } = data || {};

      if (sender === socket.id) return;
      if (!layout || !Array.isArray(layout)) return;

      setHistory({
        past: [],
        present: layout,
        future: [],
      });
    });

    socket.on("activity_event", (entry) => {
      setActivityLog((prev) => [entry, ...prev]);
    });

    socket.on("presence_update", (users) => {
      setActiveUsers(users);
    });

    socket.on("editing_widget", ({ widgetId, editor }) => {
      setEditingWidgets((prev) => ({
        ...prev,
        [widgetId]: editor,
      }));

      setTimeout(() => {
        setEditingWidgets((prev) => {
          const copy = { ...prev };
          delete copy[widgetId];
          return copy;
        });
      }, 1500);
    });

    socket.on("lock_widget", ({ widgetId, locker }) => {
      setLockedWidgets((prev) => ({
        ...prev,
        [widgetId]: locker,
      }));
    });

    socket.on("unlock_widget", ({ widgetId }) => {
      setLockedWidgets((prev) => {
        const copy = { ...prev };
        delete copy[widgetId];
        return copy;
      });
    });

    return () => {
      socket.off("connect");
      socket.off("layout_update");
      socket.disconnect();
    };
  }, [id, loading]);

  /* ---------------------- FETCH ---------------------- */

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboard(id);
        setRole(res.data.role || "owner");

        if (res.data?.layoutJson) {
          setHistory({
            past: [],
            present: res.data.layoutJson,
            future: [],
          });
          setActivityLog(res.data.activity || []);
          versionRef.current = res.data.version || 0;
        }
      } catch (err) {
        console.error("Error loading dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, [id]);

  /* ---------------------- SAVE ---------------------- */

  const debouncedSave = useMemo(
    () =>
      debounce(async (updatedWidgets: any) => {
        try {
          const currentVersion = versionRef.current;

          const res = await updateDashboard(id, {
            layoutJson: updatedWidgets,
            version: currentVersion,
          });

          versionRef.current = res.data.version;
        } catch (error: any) {
          if (error.response?.status === 409) {
            console.warn("Version conflict detected");
          } else {
            console.error("Failed to save layout");
          }
        }
      }, 800),
    [id]
  );

  const broadcastChange = (updatedWidgets: any[]) => {
    debouncedSave(updatedWidgets);
    socket.emit("layout_update", {
      dashboardId: id,
      layout: updatedWidgets,
      sender: socket.id,
    });
  };

  /* ---------------------- LAYOUT ---------------------- */

  const handleLayoutChange = (newLayout: any) => {
    if (role === "viewer") return;
    const updatedWidgets = widgets.map((widget) => {
      const layoutItem = newLayout.find(
        (l: any) => l.i === widget.id
      );

      return {
        ...widget,
        layout: layoutItem,
      };
    });

    setWithHistory(updatedWidgets);
    broadcastChange(updatedWidgets);
    // logActivity("Moved widgets");
  };

  const gridLayout = (widgets || []).map((w) => ({
    i: w.id,
    ...w.layout,
  }));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">

      <div className="flex gap-2 mb-4">
        {role !== "viewer" && (
          <>
            <button
              onClick={undo}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Undo
            </button>
            <button
              onClick={redo}
              className="bg-gray-200 px-4 py-2 rounded"
            >
              Redo
            </button>
          </>
        )}
        <button
          onClick={() => setShowActivity((prev) => !prev)}
          className="bg-gray-300 px-4 py-2 rounded"
        >
          Activity
        </button>
        {role === "owner" && (
          <button
            onClick={handleInvite}
            className="bg-purple-500 text-white px-4 py-2 rounded mb-4"
          >
            Invite User
          </button>
        )}

      </div>
      {
        role !== "viewer" && (
          <button
            className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
            onClick={() => {
              const newWidget = {
                id: Date.now().toString(),
                type: "kpi",
                layout: { x: 0, y: Infinity, w: 4, h: 4 },
                config: {
                  title: "New KPI",
                  value: 0,
                },
              };

              const updated = [...widgets, newWidget];
              setWithHistory(updated);
              broadcastChange(updated);
              logActivity("Added a widget");
            }}
          >
            Add Widget
          </button>
        )
      }
      <div className="mb-2 text-sm text-gray-500">
        Role: <span className="font-medium">{role}</span> - {role === "viewer" ? "You have view-only access so don't drag widgets they will come again on initial position after refresh page." : role === "editor" ? "You can edit widgets and layout." : "You have full control, including inviting users."}
      </div>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-sm text-gray-500">
          Active Users:
        </span>

        {activeUsers.map((userId) => (
          <div
            key={userId}
            className="w-8 h-8 rounded-full bg-blue-500 text-white text-xs flex items-center justify-center"
          >
            {userId.slice(0, 2)}
          </div>
        ))}
      </div>

      <GridLayout
        className="layout"
        layout={gridLayout}
        cols={12}
        rowHeight={30}
        width={1200}
        onLayoutChange={handleLayoutChange}
        isDraggable={role !== "viewer"}
        isResizable={role !== "viewer"}
        onDragStart={(layout, oldItem) => {
          if (role === "viewer") return;

          socket.emit("lock_widget", {
            dashboardId: id,
            widgetId: oldItem?.i,
          });
        }}
        onDragStop={(layout, oldItem) => {
          if (role === "viewer") return;

          socket.emit("unlock_widget", {
            dashboardId: id,
            widgetId: oldItem?.i,
          });
          logActivity("Moved widgets");
        }}
      >
        {widgets.map((widget) => (
          <div
            key={widget.id}
            data-grid={widget.layout}
            className={
              lockedWidgets[widget.id]
                ? "ring-2 ring-yellow-400 bg-yellow-50"
                : ""
            }
          >
            <WidgetContainer
              onEdit={
                role !== "viewer"
                  ? () => {
                    setSelectedWidget(widget)
                    logActivity("Edited widget config");
                  }
                  : undefined
              }
              widget={widget}
              role={role}
            />
          </div>
        ))}
      </GridLayout>

      <WidgetConfigPanel
        widget={selectedWidget}
        onClose={() => setSelectedWidget(null)}
        onSave={(updatedConfig) => {
          const updated = widgets.map((w) =>
            w.id === selectedWidget.id
              ? { ...w, config: updatedConfig }
              : w
          );

          setWithHistory(updated);
          broadcastChange(updated);
          logActivity("Edited widget config");
        }}
      />

      {
        showActivity && (
          <ActivityPanel activityLog={activityLog} />
        )
      }
    </div >
  );
}
