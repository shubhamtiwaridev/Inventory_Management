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
  "", // empty = relative URLs only
);

export const buildApiUrl = (path = "") => {
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

export const buildServerUrl = (path = "") => {
  // If path is already an absolute external URL (e.g., https://example.com), return as is
  if (isAbsoluteUrl(path)) {
    return String(path);
  }

  // Ensure path starts with /
  const normalizedPath = String(path || "").startsWith("/") ? path : `/${path}`;

  // If SERVER_BASE_URL is empty, return relative path (starts with /)
  if (!SERVER_BASE_URL) {
    return normalizedPath;
  }

  return `${SERVER_BASE_URL}${normalizedPath}`;
};
