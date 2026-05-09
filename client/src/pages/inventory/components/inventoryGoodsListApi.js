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

export const getGoodsListItems = async () => {
  const response = await request("/inventory/goods-list");
  return Array.isArray(response?.data) ? response.data : [];
};

export const createGoodsListItem = async (payload) => {
  const response = await request("/inventory/goods-list", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response?.data;
};

export const updateGoodsListItem = async (id, payload) => {
  const response = await request(`/inventory/goods-list/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response?.data;
};

export const deleteGoodsListItem = async (id) => {
  const response = await request(`/inventory/goods-list/${id}`, {
    method: "DELETE",
  });

  return response?.data;
};

export const importGoodsListExcel = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  return request("/inventory/goods-list/import-excel", {
    method: "POST",
    body: formData,
  });
};
