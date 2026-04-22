import axios from "axios";
import { API_BASE_URL } from "./config";
import { getAuthToken } from "./authStorage";

const API = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

API.interceptors.request.use((config) => {
  const token = getAuthToken();

  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

API.interceptors.response.use(
  (response) => response,
  async (error) => Promise.reject(error),
);

export const registerUser = async (data) => {
  const response = await API.post("/auth/register", data);
  return response;
};

export const loginUser = async (data) => {
  const response = await API.post("/auth/login", data);
  return response;
};

export const getMe = async () => {
  const response = await API.get("/auth/me");
  return response;
};

export const logoutUser = async () => {
  const response = await API.post("/auth/logout");
  return response;
};

export default API;
