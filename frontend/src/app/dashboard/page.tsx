"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboards, createDashboard, deleteDashboard, renameDashboard } from "@/src/modules/dashboard/api";
import { getWorkspaces } from "@/src/modules/workspace/api";
import { useAuthGuard } from "@/src/modules/auth/useAuthGuard";

export default function DashboardHome() {
  const router = useRouter();
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const ws = await getWorkspaces();
      const id = ws.data[0]?.id;

      setWorkspaceId(id);

      const dashRes = await getDashboards();
      setDashboards(dashRes.data);
    };

    load();
  }, []);

  useAuthGuard()

  const handleCreate = async () => {
    const res = await createDashboard("New Dashboard", workspaceId);
    router.push(`/dashboard/${res.data.id}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-4">
        Your Dashboards
      </h1>

      <button
        onClick={handleCreate}
        className="mb-4 bg-blue-500 text-white px-4 py-2 rounded"
      >
        Create Dashboard
      </button>

      <div className="grid gap-4">
        {dashboards.map((dash) => (
          <div
            key={dash.id}
            className="p-4 bg-white rounded shadow hover:shadow-md"
          >
            <div className="flex justify-between items-center">
              <span
                onClick={() =>
                  router.push(`/dashboard/${dash.id}`)
                }
                className="cursor-pointer font-medium"
              >
                {dash.name}
              </span>

              <div className="flex gap-2">
                <button
                  onClick={async () => {
                    const newName = prompt(
                      "Enter new name",
                      dash.name
                    );
                    if (!newName) return;

                    await renameDashboard(dash.id, newName);

                    setDashboards((prev) =>
                      prev.map((d) =>
                        d.id === dash.id
                          ? { ...d, name: newName }
                          : d
                      )
                    );
                  }}
                  className="text-blue-500 text-sm"
                >
                  Rename
                </button>

                <button
                  onClick={async () => {
                    await deleteDashboard(dash.id);

                    setDashboards((prev) =>
                      prev.filter((d) => d.id !== dash.id)
                    );
                  }}
                  className="text-red-500 text-sm"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>

        ))}
      </div>
    </div>
  );
}
