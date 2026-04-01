import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const loginRequest = (formData) => {
  return axios.post(`${API_URL}/api/auth/login`, formData);
};

export const registerRequest = (formData) => {
  return axios.post(`${API_URL}/api/auth/register`, formData);
};

export const getMeRequest = (token) => {
  return axios.get(`${API_URL}/api/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};