import { authFetch } from "../../../api/authFetch.js";
import { buildApiUrl } from "../../../api/config.js";

const request = async (path, options = {}) => {
  const response = await authFetch(buildApiUrl(path), options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export const getWarehouses = async () => {
  const response = await request("/inventory/warehouses");
  return Array.isArray(response?.data) ? response.data : [];
};

export const createWarehouse = async (payload) => {
  const response = await request("/inventory/warehouses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response?.data;
};

export const updateWarehouse = async (id, payload) => {
  const response = await request(`/inventory/warehouses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response?.data;
};

export const deleteWarehouse = async (id) => {
  const response = await request(`/inventory/warehouses/${id}`, {
    method: "DELETE",
  });

  return response?.data;
};
