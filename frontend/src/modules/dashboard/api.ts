import api from "@/src/services/axios";

export const getDashboard = async (id: string) => {
  const res = await api.get(`/dashboard/${id}`);
  return res.data;
};

export const createDashboard = async (
  name: string,
  workspaceId: string
) => {
  const res = await api.post("/dashboard", {
    name,
    workspaceId,
  });
  return res.data;
};

export const updateDashboard = async (
  id: string,
  data: {
    layoutJson: any;
    version: number;
  }
) => {
  const res = await api.put(`/dashboard/${id}`, data);
  return res.data;
};

export const getDashboards = async (workspaceId: string) => {
  const res = await api.get(`/dashboard?workspaceId=${workspaceId}`);
  return res.data;
};

