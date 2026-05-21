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

export const getUploadCenterFiles = async () => {
  const response = await request("/ecom/upload-center");
  return Array.isArray(response?.data) ? response.data : [];
};

export const uploadFilesToUploadCenter = async ({
  files = [],
  description = "",
} = {}) => {
  const formData = new FormData();
  files.forEach((file) => {
    formData.append("files", file);
  });
  formData.append("description", description);

  return request("/ecom/upload-center", {
    method: "POST",
    body: formData,
  });
};

export const updateUploadCenterFile = async (id, payload = {}) => {
  const response = await request(`/ecom/upload-center/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return response?.data;
};

export const deleteUploadCenterFile = async (id) => {
  const response = await request(`/ecom/upload-center/${id}`, {
    method: "DELETE",
  });

  return response?.data;
};
