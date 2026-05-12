import { authFetch } from "../../../api/authFetch.js";
import { buildApiUrl } from "../../../api/config.js";

const INVENTORY_SUMMARY_CACHE_TTL_MS = 30 * 1000;
let inventorySummaryCache = {
  expiresAt: 0,
  data: null,
};

const request = async (path, options = {}) => {
  const response = await authFetch(buildApiUrl(path), options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

const cloneInventorySummary = (data = {}) => ({
  totals: { ...(data.totals || {}) },
  items: Array.isArray(data.items)
    ? data.items.map((item) => ({ ...item }))
    : [],
});

const invalidateInventorySummaryCache = () => {
  inventorySummaryCache = {
    expiresAt: 0,
    data: null,
  };
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

  invalidateInventorySummaryCache();
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

  invalidateInventorySummaryCache();
  return response?.data;
};

export const deleteInventoryTransaction = async (type, id) => {
  const response = await request(`/inventory/${type}/${id}`, {
    method: "DELETE",
  });

  invalidateInventorySummaryCache();
  return response?.data;
};

export const getAvailableOutboundItems = async () => {
  const response = await request("/inventory/outbound/available-items");
  return Array.isArray(response?.data) ? response.data : [];
};

export const getInventorySummary = async ({ skipCache = false } = {}) => {
  if (
    !skipCache &&
    inventorySummaryCache.data &&
    inventorySummaryCache.expiresAt > Date.now()
  ) {
    return cloneInventorySummary(inventorySummaryCache.data);
  }

  const response = await request("/inventory/inbound/inventory-summary");
  const data = response?.data || { totals: {}, items: [] };
  inventorySummaryCache = {
    expiresAt: Date.now() + INVENTORY_SUMMARY_CACHE_TTL_MS,
    data: cloneInventorySummary(data),
  };
  return data;
};
