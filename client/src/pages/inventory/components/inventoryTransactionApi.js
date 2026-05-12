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

export const getInventoryTransactions = async (type) => {
  const response = await request(`/inventory/${type}`);
  return Array.isArray(response?.data) ? response.data : [];
};

export const createInventoryTransaction = async (type, payload) => {
  const response = await request(`/inventory/${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response?.data;
};

export const updateInventoryTransaction = async (type, id, payload) => {
  const response = await request(`/inventory/${type}/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response?.data;
};

export const deleteInventoryTransaction = async (type, id) => {
  const response = await request(`/inventory/${type}/${id}`, {
    method: "DELETE",
  });

  return response?.data;
};

export const getAvailableOutboundItems = async () => {
  const response = await request("/inventory/outbound/available-items");
  return Array.isArray(response?.data) ? response.data : [];
};

export const getInventorySummary = async () => {
  const response = await request("/inventory/inbound/inventory-summary");
  return response?.data || { totals: {}, items: [] };
};
