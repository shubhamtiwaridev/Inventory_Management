import { authFetch } from "../../../api/authFetch.js";
import { buildApiUrl } from "../../../api/config.js";

const PRODUCTS_CACHE_TTL_MS = 60 * 1000;
let productsCache = { expiresAt: 0, items: null };

const request = async (path, options = {}) => {
  const response = await authFetch(buildApiUrl(path), options);
  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

const cloneItems = (items = []) => items.map((i) => ({ ...i }));

const invalidateProductsCache = () => {
  productsCache = { expiresAt: 0, items: null };
};

const setProductsCache = (items = []) => {
  productsCache = {
    expiresAt: Date.now() + PRODUCTS_CACHE_TTL_MS,
    items: cloneItems(items),
  };
};

export const getEcomProducts = async ({ skipCache = false } = {}) => {
  if (
    !skipCache &&
    productsCache.items &&
    productsCache.expiresAt > Date.now()
  ) {
    return cloneItems(productsCache.items);
  }

  const response = await request("/ecom/products");
  const items = Array.isArray(response?.data) ? response.data : [];
  setProductsCache(items);
  return items;
};

export const createEcomProduct = async (payload) => {
  const response = await request("/ecom/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const item = response?.data || null;
  if (item && Array.isArray(productsCache.items)) {
    setProductsCache([item, ...productsCache.items]);
  } else {
    invalidateProductsCache();
  }

  return item;
};

export const updateEcomProduct = async (id, payload) => {
  const response = await request(`/ecom/products/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const item = response?.data || null;
  if (item && Array.isArray(productsCache.items)) {
    setProductsCache(productsCache.items.map((p) => (p.id === id ? item : p)));
  } else {
    invalidateProductsCache();
  }

  return item;
};

export const deleteEcomProduct = async (id) => {
  const response = await request(`/ecom/products/${id}`, { method: "DELETE" });
  const item = response?.data || null;

  if (Array.isArray(productsCache.items)) {
    setProductsCache(productsCache.items.filter((p) => p.id !== id));
  } else {
    invalidateProductsCache();
  }

  return item;
};

export const importEcomProductsExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await request("/ecom/products/import-excel", {
    method: "POST",
    body: formData,
  });

  const items = Array.isArray(response?.data) ? response.data : null;

  if (items) setProductsCache(items);
  else invalidateProductsCache();

  return response;
};
