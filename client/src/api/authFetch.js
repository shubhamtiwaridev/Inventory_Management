import { clearAuthSession, getAuthHeaders } from "./authStorage";

export const authFetch = async (url, options = {}) => {
  const { headers = {}, ...rest } = options;

  const response = await fetch(url, {
    credentials: "include",
    ...rest,
    headers: getAuthHeaders(headers),
  });

  if (response.status === 401) {
    clearAuthSession();
  }

  return response;
};

export default authFetch;
