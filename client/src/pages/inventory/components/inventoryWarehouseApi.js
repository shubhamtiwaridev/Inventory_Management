import { authFetch } from "../../../api/authFetch.js";
import { buildApiUrl } from "../../../api/config.js";

const WAREHOUSE_CACHE_TTL_MS = 60 * 1000;
let warehouseCache = {
  expiresAt: 0,
  items: null,
};

const request = async (path, options = {}) => {
  const response = await authFetch(buildApiUrl(path), options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

const cloneItems = (items = []) => items.map((item) => ({ ...item }));

const invalidateWarehouseCache = () => {
  warehouseCache = {
    expiresAt: 0,
    items: null,
  };
};

export const getWarehouses = async ({ skipCache = false } = {}) => {
  if (
    !skipCache &&
    warehouseCache.items &&
    warehouseCache.expiresAt > Date.now()
  ) {
    return cloneItems(warehouseCache.items);
  }

  const response = await request("/inventory/warehouses");
  const items = Array.isArray(response?.data) ? response.data : [];
  warehouseCache = {
    expiresAt: Date.now() + WAREHOUSE_CACHE_TTL_MS,
    items: cloneItems(items),
  };
  return items;
};

export const createWarehouse = async (payload) => {
  const response = await request("/inventory/warehouses", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  invalidateWarehouseCache();
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

  invalidateWarehouseCache();
  return response?.data;
};

export const deleteWarehouse = async (id) => {
  const response = await request(`/inventory/warehouses/${id}`, {
    method: "DELETE",
  });

  invalidateWarehouseCache();
  return response?.data;
};
