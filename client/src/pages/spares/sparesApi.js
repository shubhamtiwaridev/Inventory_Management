import { API_BASE_URL } from "../../api/config";
import { clearAuthSession, getAuthHeaders } from "../../api/authStorage";

const request = async (url, options = {}) => {
  const { body, headers = {}, ...rest } = options;

  const response = await fetch(`${API_BASE_URL}${url}`, {
    credentials: "include",
    headers: getAuthHeaders({
      "Content-Type": "application/json",
      ...headers,
    }),
    body: body ? JSON.stringify(body) : undefined,
    ...rest,
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }

    throw new Error(data.message || "Something went wrong");
  }

  return data;
};

export const getSpareRecords = async () => request("/spares/items");

export const getSpareSuppliers = async () =>
  request("/spares/suppliers");

export const createSpareRecord = async (payload) =>
  request("/spares/items", { method: "POST", body: payload });

export const updateSpareRecord = async (id, payload) =>
  request(`/spares/items/${id}`, {
    method: "PUT",
    body: payload,
  });

export const createSpareSupplier = async (payload) =>
  request("/spares/suppliers", { method: "POST", body: payload });
