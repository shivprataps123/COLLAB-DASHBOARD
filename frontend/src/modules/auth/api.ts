import api from "@/src/services/axios";

export const loginUser = async (data: {
  email: string;
  password: string;
}) => {
  const res = await api.post("/auth/login", data);
  return res.data;
};

export const registerUser = async (data: {
  email: string;
  password: string;
  name?: string;
}) => {
  const res = await api.post("/auth/register", data);
  return res.data;
};
