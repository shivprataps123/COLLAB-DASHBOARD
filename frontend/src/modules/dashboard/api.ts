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

export const getDashboards = async () => {
  const res = await api.get(`/dashboard`);
  return res.data;
};

export const renameDashboard = async (
  id: string,
  name: string
) => {
  const res = await api.put(`/dashboard/${id}/rename`, {
    name,
  });
  return res.data;
};

export const deleteDashboard = async (id: string) => {
  const res = await api.delete(`/dashboard/${id}`);
  return res.data;
};
