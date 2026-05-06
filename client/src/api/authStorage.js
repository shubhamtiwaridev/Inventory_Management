const AUTH_TOKEN_KEY = "inventory_auth_token";
export const AUTH_USER_KEY = "inventory_auth_user";
export const AUTH_SESSION_CLEARED_EVENT = "inventory-auth-session-cleared";
export const AUTH_TOKEN_UPDATED_EVENT = "inventory-auth-token-updated";

const decodeBase64Url = (value = "") => {
  const normalized = String(value).replace(/-/g, "+").replace(/_/g, "/");

  const padding = normalized.length % 4;
  const padded =
    padding === 0 ? normalized : normalized + "=".repeat(4 - padding);

  return atob(padded);
};

const parseTokenPayload = (token = "") => {
  try {
    const [, payload = ""] = String(token).split(".");
    if (!payload) return null;

    return JSON.parse(decodeBase64Url(payload));
  } catch {
    return null;
  }
};

export const removeAuthToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_TOKEN_KEY);
  window.dispatchEvent(new CustomEvent(AUTH_TOKEN_UPDATED_EVENT));
};

export const getStoredAuthUser = () => {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(AUTH_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredAuthUser = (user) => {
  if (typeof window === "undefined") return;

  if (!user) {
    localStorage.removeItem(AUTH_USER_KEY);
    return;
  }

  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
};

export const removeStoredAuthUser = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(AUTH_USER_KEY);
};

export const clearStoredAuthSession = () => {
  removeAuthToken();
  removeStoredAuthUser();
};

export const notifyAuthSessionCleared = () => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(AUTH_SESSION_CLEARED_EVENT));
};

export const notifyAuthTokenUpdated = () => {
  if (typeof window === "undefined") return;

  window.dispatchEvent(new CustomEvent(AUTH_TOKEN_UPDATED_EVENT));
};

const isPublicAuthPath = (pathname = "") =>
  ["/login", "/register", "/forgot-password", "/"].includes(pathname);

export const redirectToLoginIfNeeded = () => {
  if (typeof window === "undefined") return;

  const { pathname = "", search = "", hash = "" } = window.location;

  if (isPublicAuthPath(pathname)) {
    return;
  }

  const redirectTarget = `${pathname}${search}${hash}`;
  const encodedTarget = encodeURIComponent(redirectTarget || "/dashboard");

  window.location.replace(`/login?from=${encodedTarget}`);
};

export const clearAuthSession = () => {
  clearStoredAuthSession();
  notifyAuthSessionCleared();
  redirectToLoginIfNeeded();
};

export const isAuthTokenExpired = (token = "") => {
  if (!token) return true;

  const payload = parseTokenPayload(token);

  if (!payload?.exp) {
    return false;
  }

  return Date.now() >= payload.exp * 1000;
};

export const getAuthTokenExpiryTime = (token = "") => {
  const payload = parseTokenPayload(token);

  if (!payload?.exp) {
    return null;
  }

  return payload.exp * 1000;
};

export const getAuthToken = () => {
  if (typeof window === "undefined") return "";

  const token = localStorage.getItem(AUTH_TOKEN_KEY) || "";

  if (!token) return "";

  if (isAuthTokenExpired(token)) {
    clearAuthSession();
    return "";
  }

  return token;
};

export const setAuthToken = (token) => {
  if (typeof window === "undefined") return;

  if (!token || isAuthTokenExpired(token)) {
    clearAuthSession();
    return;
  }

  localStorage.setItem(AUTH_TOKEN_KEY, token);
  notifyAuthTokenUpdated();
};

export const getAuthHeaders = (headers = {}) => {
  const token = getAuthToken();

  if (!token) {
    return headers;
  }

  return {
    ...headers,
    Authorization: `Bearer ${token}`,
  };
};
