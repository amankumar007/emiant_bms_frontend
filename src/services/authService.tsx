import axios from "./axiosConfig";

const BASE = import.meta.env.VITE_API_URL;

export const registerApi = async (
  username: string,
  email: string,
  password: string,
  role: "admin" | "engineer" | "technician"
) => {
  const response = await axios.post(`${BASE}/api/auth/signup`, {
    username,
    email,
    password,
    role,
  });
  return response.data;
};

export const loginApi = async (email: string, password: string) => {
  const response = await axios.post(`${BASE}/api/auth/login`, {
    email,
    password,
  });
  return response.data;
};
