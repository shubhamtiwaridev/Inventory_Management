import { API_BASE_URL } from "../../api/config";
import { authFetch } from "../../api/authFetch";

const getCache = new Map();

export const clearGetCache = () => {
  getCache.clear();
};

export const clearAllCache = () => {
  clearGetCache();
};

const getCacheKey = (url) => url;

const request = async (url, options = {}) => {
  const method = String(options.method || "GET").toUpperCase();
  const isGetRequest = method === "GET";
  const cacheKey = getCacheKey(url);

  if (isGetRequest && getCache.has(cacheKey)) {
    return getCache.get(cacheKey);
  }

  const response = await authFetch(`${API_BASE_URL}${url}`, {
    ...options,
    method,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  if (isGetRequest) {
    getCache.set(cacheKey, data);
  } else {
    clearAllCache();
  }

  return data;
};

/* Staff Users */

export const getStaffUsers = async () => {
  return request("/staff-page");
};

export const createStaffUser = async (payload) => {
  return request("/staff-page", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateStaffUser = async (id, payload) => {
  return request(`/staff-page/${id}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
};

export const deleteStaffUser = async (id) => {
  return request(`/staff-page/${id}`, {
    method: "DELETE",
  });
};

export const verifyStaffUser = async (id) => {
  return request(`/staff-page/${id}/verify`, {
    method: "PATCH",
  });
};

export const clearPasswordRequest = async (id) => {
  return request(`/staff-page/${id}/clear-password-request`, {
    method: "PATCH",
  });
};

/* Staff Types */

export const getStaffTypes = async () => {
  return request("/staff-types");
};

export const createStaffType = async (payload) => {
  return request("/staff-types", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateStaffType = async (id, payload) => {
  return request(`/staff-types/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteStaffType = async (id) => {
  return request(`/staff-types/${id}`, {
    method: "DELETE",
  });
};

/* Cards */

export const getCards = async () => {
  return request("/cards");
};

export const createCard = async (payload) => {
  return request("/cards", {
    method: "POST",
    body: JSON.stringify(payload),
  });
};

export const updateCard = async (id, payload) => {
  return request(`/cards/${id}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
};

export const deleteCard = async (id) => {
  return request(`/cards/${id}`, {
    method: "DELETE",
  });
};

export const getUserPermissions = async (userId) => {
  return request(`/staff-page/${userId}/permissions`);
};

export const updateUserPermissions = async (userId, permissions) => {
  return request(`/staff-page/${userId}/permissions`, {
    method: "PUT",
    body: JSON.stringify({ permissions }),
  });
};
