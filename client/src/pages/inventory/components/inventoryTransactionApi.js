import { authFetch } from "../../../api/authFetch.js";
import { buildApiUrl } from "../../../api/config.js";

const INVENTORY_SUMMARY_CACHE_TTL_MS = 30 * 1000;
const INVENTORY_TRANSACTION_CACHE_TTL_MS = 30 * 1000;
const AVAILABLE_OUTBOUND_CACHE_TTL_MS = 30 * 1000;
const DEFAULT_EMPTY_ITEMS = [];

let inventoryTransactionCache = {
  inbound: {
    expiresAt: 0,
    items: null,
  },
  outbound: {
    expiresAt: 0,
    items: null,
  },
};

let availableOutboundItemsCache = {
  expiresAt: 0,
  items: null,
};

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

const cloneItems = (items = DEFAULT_EMPTY_ITEMS) =>
  Array.isArray(items) ? items.map((item) => ({ ...item })) : [];

const invalidateInventoryTransactionCache = (type) => {
  if (type && inventoryTransactionCache[type]) {
    inventoryTransactionCache[type] = {
      expiresAt: 0,
      items: null,
    };
    return;
  }

  inventoryTransactionCache = {
    inbound: {
      expiresAt: 0,
      items: null,
    },
    outbound: {
      expiresAt: 0,
      items: null,
    },
  };
};

const invalidateAvailableOutboundItemsCache = () => {
  availableOutboundItemsCache = {
    expiresAt: 0,
    items: null,
  };
};

const invalidateInventorySummaryCache = () => {
  inventorySummaryCache = {
    expiresAt: 0,
    data: null,
  };
};

export const getInventoryTransactions = async (type, { skipCache = false } = {}) => {
  const cacheKey = type === "outbound" ? "outbound" : "inbound";

  if (
    !skipCache &&
    inventoryTransactionCache[cacheKey]?.items &&
    inventoryTransactionCache[cacheKey].expiresAt > Date.now()
  ) {
    return cloneItems(inventoryTransactionCache[cacheKey].items);
  }

  const response = await request(`/inventory/${type}`);
  const items = Array.isArray(response?.data) ? response.data : [];
  inventoryTransactionCache[cacheKey] = {
    expiresAt: Date.now() + INVENTORY_TRANSACTION_CACHE_TTL_MS,
    items: cloneItems(items),
  };
  return items;
};

export const createInventoryTransaction = async (type, payload) => {
  const response = await request(`/inventory/${type}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  invalidateInventoryTransactionCache(type);
  invalidateAvailableOutboundItemsCache();
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

  invalidateInventoryTransactionCache(type);
  invalidateAvailableOutboundItemsCache();
  invalidateInventorySummaryCache();
  return response?.data;
};

export const deleteInventoryTransaction = async (type, id) => {
  const response = await request(`/inventory/${type}/${id}`, {
    method: "DELETE",
  });

  invalidateInventoryTransactionCache(type);
  invalidateAvailableOutboundItemsCache();
  invalidateInventorySummaryCache();
  return response?.data;
};

export const getAvailableOutboundItems = async ({ skipCache = false } = {}) => {
  if (
    !skipCache &&
    availableOutboundItemsCache.items &&
    availableOutboundItemsCache.expiresAt > Date.now()
  ) {
    return cloneItems(availableOutboundItemsCache.items);
  }

  const response = await request("/inventory/outbound/available-items");
  const items = Array.isArray(response?.data) ? response.data : [];
  availableOutboundItemsCache = {
    expiresAt: Date.now() + AVAILABLE_OUTBOUND_CACHE_TTL_MS,
    items: cloneItems(items),
  };
  return items;
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
