import api from "@/src/services/axios";

export const getWorkspaces = async () => {
  const res = await api.get("/workspace");
  return res.data;
};

export const createWorkspace = async (name: string) => {
  const res = await api.post("/workspace", { name });
  return res.data;
};
