/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { getMe, loginUser, logoutUser, registerUser } from "../api/auth";
import {
  AUTH_TOKEN_UPDATED_EVENT,
  AUTH_SESSION_CLEARED_EVENT,
  clearAuthSession,
  getAuthTokenExpiryTime,
  clearStoredAuthSession,
  getAuthToken,
  getStoredAuthUser,
  removeStoredAuthUser,
  setAuthToken,
  setStoredAuthUser,
} from "../api/authStorage";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() =>
    getAuthToken() ? getStoredAuthUser() : null,
  );
  const [authLoading, setAuthLoading] = useState(true);

  const clearAuth = useCallback(() => {
    clearStoredAuthSession();
    setUser(null);
  }, []);

  const fetchMe = useCallback(async () => {
    try {
      const response = await getMe();
      const loggedInUser = response?.data?.user || null;

      if (loggedInUser) {
        setUser(loggedInUser);
        setStoredAuthUser(loggedInUser);
        return {
          user: loggedInUser,
          shouldLogout: false,
        };
      }

      clearAuth();
      return {
        user: null,
        shouldLogout: true,
      };
    } catch (error) {
      const status = error?.response?.status;

      if (status === 401 || status === 403) {
        clearAuth();
        return {
          user: null,
          shouldLogout: true,
        };
      }

      return {
        user: getStoredAuthUser(),
        shouldLogout: false,
      };
    }
  }, [clearAuth]);

  const restoreSession = useCallback(async () => {
    setAuthLoading(true);

    try {
      const token = getAuthToken();

      const cachedUser = getStoredAuthUser();
      if (token && cachedUser) {
        setUser(cachedUser);
      }

      let result = await fetchMe();

      if (!token && !result?.user) {
        clearAuth();
        return;
      }

      if (token && !result?.user && !result?.shouldLogout) {
        result = await fetchMe();
      }

      if (result?.shouldLogout) {
        try {
          await logoutUser();
        } catch {
          // ignore logout cleanup error
        }
      }
    } finally {
      setAuthLoading(false);
    }
  }, [clearAuth, fetchMe]);

  useEffect(() => {
    restoreSession();
  }, [restoreSession]);

  useEffect(() => {
    const handleSessionCleared = () => {
      removeStoredAuthUser();
      setUser(null);
    };

    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, handleSessionCleared);

    return () => {
      window.removeEventListener(
        AUTH_SESSION_CLEARED_EVENT,
        handleSessionCleared,
      );
    };
  }, []);

  useEffect(() => {
    let timeoutId;

    const clearExpiryTimer = () => {
      if (timeoutId) {
        window.clearTimeout(timeoutId);
        timeoutId = undefined;
      }
    };

    const syncExpiryTimer = () => {
      clearExpiryTimer();

      const token = getAuthToken();
      if (!token) {
        return;
      }

      const expiryTime = getAuthTokenExpiryTime(token);
      if (!expiryTime) {
        return;
      }

      const remainingMs = expiryTime - Date.now();

      if (remainingMs <= 0) {
        clearAuthSession();
        return;
      }

      timeoutId = window.setTimeout(() => {
        clearAuthSession();
      }, remainingMs);
    };

    syncExpiryTimer();

    window.addEventListener(AUTH_TOKEN_UPDATED_EVENT, syncExpiryTimer);
    window.addEventListener(AUTH_SESSION_CLEARED_EVENT, syncExpiryTimer);

    return () => {
      clearExpiryTimer();
      window.removeEventListener(AUTH_TOKEN_UPDATED_EVENT, syncExpiryTimer);
      window.removeEventListener(AUTH_SESSION_CLEARED_EVENT, syncExpiryTimer);
    };
  }, []);

  const register = useCallback(async (formData) => {
    const response = await registerUser(formData);
    return response?.data;
  }, []);

  const login = useCallback(async (formData) => {
    const response = await loginUser(formData);
    const data = response?.data || {};

    if (!data?.token || !data?.user) {
      throw new Error(data?.message || "Login failed");
    }

    setAuthToken(data.token);
    setStoredAuthUser(data.user);
    setUser(data.user);

    return data;
  }, []);

  const logout = useCallback(async () => {
    try {
      await logoutUser();
    } finally {
      clearAuth();
    }
  }, [clearAuth]);

  const value = useMemo(
    () => ({
      user,
      setUser,
      loading: authLoading,
      authLoading,
      hasValidToken: !!getAuthToken(),
      isAuthenticated: !!user,
      register,
      login,
      logout,
      fetchMe,
      refreshMe: restoreSession,
    }),
    [user, authLoading, register, login, logout, fetchMe, restoreSession],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }

  return context;
};
