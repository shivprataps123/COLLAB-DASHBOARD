"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import GridLayout from "react-grid-layout";
import { getDashboard, updateDashboard } from "@/src/modules/dashboard/api";
import { debounce } from "lodash";
import { useMemo } from "react";
import WidgetContainer from "../components/WidgetContainer";
import { useAuthGuard } from "@/src/modules/auth/useAuthGuard";
import { socket } from "@/src/services/socket";
import WidgetConfigPanel from "../components/WidgetConfigPanel";

export default function DashboardPage() {
  const params = useParams();
  const id = params.id as string;
  const versionRef = useRef(0);

  const [widgets, setWidgets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeUsers, setActiveUsers] = useState<string[]>([]);
  const [editingWidgets, setEditingWidgets] = useState<
    Record<string, string>
  >({});
  const [lockedWidgets, setLockedWidgets] = useState<
    Record<string, string>
  >({});
  const [selectedWidget, setSelectedWidget] = useState<any>(null);
  const [version, setVersion] = useState(0);

  useEffect(() => {
    socket.connect();

    socket.emit("join_dashboard", id);

    socket.on("layout_update", (updatedLayout) => {
      setWidgets(updatedLayout);
    });

    socket.on("presence_update", (users) => {
      setActiveUsers(users);
    });

    socket.on("editing_widget", ({ widgetId, editor }) => {
      setEditingWidgets((prev) => ({
        ...prev,
        [widgetId]: editor,
      }));

      // remove highlight after 1.5s
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
      socket.disconnect();
    };
  }, [id]);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await getDashboard(id);

        if (res.data?.layoutJson) {
          setWidgets(res.data.layoutJson);
          setVersion(res.data.version || 0);
          versionRef.current = res.data.version || 0;
        } else {
          // Default layout
          setWidgets([
            {
              id: "1",
              type: "text",
              layout: { x: 0, y: 0, w: 4, h: 4 },
              config: {
                text: "Editable text widget",
              },
            },
          ]);
        }
      } catch (err) {
        console.error("Error loading dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();

  }, [id]);

  useAuthGuard();

  const debouncedSave = useMemo(
    () =>
      debounce(async (updatedWidgets: any) => {
        try {
          const currentVersion = versionRef.current;

          const res = await updateDashboard(id, {
            layoutJson: updatedWidgets,
            version: currentVersion,
          });

          // update version from server response
          const newVersion = res.data.version;

          setVersion(newVersion);
          versionRef.current = newVersion;
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

  const handleLayoutChange = (newLayout: any) => {

    const updatedWidgets = widgets.map((widget) => {
      const layoutItem = newLayout.find(
        (l: any) => l.i === widget.id
      );

      return {
        ...widget,
        layout: layoutItem,
      };
    });
    socket.emit("layout_update", {
      dashboardId: id,
      layout: updatedWidgets,
    });

    setWidgets(updatedWidgets);
    debouncedSave(updatedWidgets);
  };


  const gridLayout = widgets.map((w) => ({
    i: w.id,
    ...w.layout,
  }));

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-6">
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
          setWidgets(updated);
          debouncedSave(updated);
        }}
      >
        Add Widget
      </button>
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
        isDraggable={(layoutItem: any) =>
          !lockedWidgets[layoutItem.i]
        }
        onDragStart={(layout, oldItem) => {
          socket.emit("lock_widget", {
            dashboardId: id,
            widgetId: oldItem?.i,
          });
        }}
        onDragStop={(layout, oldItem) => {
          socket.emit("unlock_widget", {
            dashboardId: id,
            widgetId: oldItem?.i,
          });
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
            <WidgetContainer onEdit={() => setSelectedWidget(widget)} widget={widget}
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

          setWidgets(updated);
          debouncedSave(updated);

          socket.emit("layout_update", {
            dashboardId: id,
            layout: updated,
          });
        }}
      />

    </div>
  );
}
