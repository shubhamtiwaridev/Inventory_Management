const trimTrailingSlash = (value = "") => String(value).replace(/\/+$/, "");
const isAbsoluteUrl = (value = "") => /^https?:\/\//i.test(String(value || ""));

const normalizeBaseUrl = (value, fallback = "") => {
  const normalizedValue = trimTrailingSlash(value || "");
  if (normalizedValue) return normalizedValue;
  return trimTrailingSlash(fallback);
};

export const API_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_API_URL,
  "/api",
);

export const SERVER_BASE_URL = normalizeBaseUrl(
  import.meta.env.VITE_SERVER_URL,
  API_BASE_URL.replace(/\/api\/?$/, ""),
);

export const buildApiUrl = (path = "") => {
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const buildServerUrl = (path = "") => {
  if (isAbsoluteUrl(path)) {
    return String(path);
  }

  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${SERVER_BASE_URL}${normalizedPath}`;
};
