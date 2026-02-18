"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getDashboards, createDashboard } from "@/src/modules/dashboard/api";
import { getWorkspaces } from "@/src/modules/workspace/api";

export default function DashboardHome() {
  const router = useRouter();
  const [dashboards, setDashboards] = useState<any[]>([]);
  const [workspaceId, setWorkspaceId] = useState<string>("");

  useEffect(() => {
    const load = async () => {
      const ws = await getWorkspaces();
      const id = ws.data[0]?.id;

      setWorkspaceId(id);

      const dashRes = await getDashboards(id);
      setDashboards(dashRes.data);
    };

    load();
  }, []);

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
            onClick={() =>
              router.push(`/dashboard/${dash.id}`)
            }
            className="p-4 bg-white rounded shadow cursor-pointer hover:shadow-md"
          >
            {dash.name}
          </div>
        ))}
      </div>
    </div>
  );
}
