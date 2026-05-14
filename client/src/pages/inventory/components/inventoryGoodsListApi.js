import { authFetch } from "../../../api/authFetch.js";
import { buildApiUrl } from "../../../api/config.js";

const GOODS_LIST_CACHE_TTL_MS = 60 * 1000;
let goodsListCache = {
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

const invalidateGoodsListCache = () => {
  goodsListCache = {
    expiresAt: 0,
    items: null,
  };
};

const setGoodsListCache = (items = []) => {
  goodsListCache = {
    expiresAt: Date.now() + GOODS_LIST_CACHE_TTL_MS,
    items: cloneItems(items),
  };
};

export const getGoodsListItems = async ({ skipCache = false } = {}) => {
  if (
    !skipCache &&
    goodsListCache.items &&
    goodsListCache.expiresAt > Date.now()
  ) {
    return cloneItems(goodsListCache.items);
  }

  const response = await request("/inventory/goods-list");
  const items = Array.isArray(response?.data) ? response.data : [];
  setGoodsListCache(items);
  return items;
};

export const createGoodsListItem = async (payload) => {
  const response = await request("/inventory/goods-list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const item = response?.data || null;

  if (item && Array.isArray(goodsListCache.items)) {
    setGoodsListCache([item, ...goodsListCache.items]);
  } else {
    invalidateGoodsListCache();
  }

  return item;
};

export const updateGoodsListItem = async (id, payload) => {
  const response = await request(`/inventory/goods-list/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const item = response?.data || null;

  if (item && Array.isArray(goodsListCache.items)) {
    setGoodsListCache(
      goodsListCache.items.map((existingItem) =>
        existingItem.id === id ? item : existingItem,
      ),
    );
  } else {
    invalidateGoodsListCache();
  }

  return item;
};

export const deleteGoodsListItem = async (id) => {
  const response = await request(`/inventory/goods-list/${id}`, {
    method: "DELETE",
  });

  const item = response?.data || null;

  if (Array.isArray(goodsListCache.items)) {
    setGoodsListCache(
      goodsListCache.items.filter((existingItem) => existingItem.id !== id),
    );
  } else {
    invalidateGoodsListCache();
  }

  return item;
};

export const importGoodsListExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await request("/inventory/goods-list/import-excel", {
    method: "POST",
    body: formData,
  });

  const items = Array.isArray(response?.data) ? response.data : null;

  if (items) {
    setGoodsListCache(items);
  } else {
    invalidateGoodsListCache();
  }

  return response;
};
