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

const setWarehouseCache = (items = []) => {
  warehouseCache = {
    expiresAt: Date.now() + WAREHOUSE_CACHE_TTL_MS,
    items: cloneItems(items),
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
  setWarehouseCache(items);
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

  const item = response?.data || null;

  if (item && Array.isArray(warehouseCache.items)) {
    setWarehouseCache([item, ...warehouseCache.items]);
  } else {
    invalidateWarehouseCache();
  }

  return item;
};

export const updateWarehouse = async (id, payload) => {
  const response = await request(`/inventory/warehouses/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const item = response?.data || null;

  if (item && Array.isArray(warehouseCache.items)) {
    setWarehouseCache(
      warehouseCache.items.map((existingItem) =>
        existingItem.id === id ? item : existingItem,
      ),
    );
  } else {
    invalidateWarehouseCache();
  }

  return item;
};

export const deleteWarehouse = async (id) => {
  const response = await request(`/inventory/warehouses/${id}`, {
    method: "DELETE",
  });

  const item = response?.data || null;

  if (Array.isArray(warehouseCache.items)) {
    setWarehouseCache(
      warehouseCache.items.filter((existingItem) => existingItem.id !== id),
    );
  } else {
    invalidateWarehouseCache();
  }

  return item;
};
