// import axios from "axios";

// const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// const api = axios.create({
//   baseURL: API_URL,
// });

// export const loginRequest = (formData) => {
//   return api.post("/api/auth/login", formData);
// };

// export const registerRequest = (formData) => {
//   return api.post("/api/auth/register", formData);
// };

// export const getMeRequest = (token) => {
//   return api.get("/api/auth/me", {
//     headers: {
//       Authorization: `Bearer ${token}`,
//     },
//   });
// };

// export const changePasswordRequest = (formData) => {
//   return api.post("/api/auth/change-password", formData);
// };


import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const api = axios.create({
  baseURL: API_URL,
});

export const loginRequest = (formData) => {
  return api.post("/api/auth/login", formData);
};

export const registerRequest = (formData) => {
  return api.post("/api/auth/register", formData);
};

export const getMeRequest = (token) => {
  return api.get("/api/auth/me", {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const changePasswordRequest = (formData) => {
  return api.post("/api/auth/change-password", formData);
};

export const forgotPasswordRequest = (formData) => {
  return api.post("/api/auth/forgot-password-request", formData);
};