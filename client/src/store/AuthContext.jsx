/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, loginUser, logoutUser, registerUser } from "../api/auth";

const AuthContext = createContext(null);
const AUTH_FLAG = "isAuthenticated";

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await getMe();
      const loggedInUser = res?.data?.user || null;

      setUser(loggedInUser);

      if (loggedInUser) {
        localStorage.setItem(AUTH_FLAG, "true");
      } else {
        localStorage.removeItem(AUTH_FLAG);
      }

      return loggedInUser;
    } catch (err) {
      if (!err.response) {
        console.error("Backend server is not running");
      } else if (err.response?.status === 401) {
        localStorage.removeItem(AUTH_FLAG);
      } else {
        console.error("fetchMe error:", err);
      }

      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const hasSession = localStorage.getItem(AUTH_FLAG) === "true";

    if (hasSession) {
      fetchMe();
    } else {
      setLoading(false);
    }
  }, []);

  const register = async (formData) => {
    const res = await registerUser(formData);
    return res.data;
  };

  const login = async (formData) => {
    const res = await loginUser(formData);
    const loggedInUser = res?.data?.user || null;

    setUser(loggedInUser);

    if (loggedInUser) {
      localStorage.setItem(AUTH_FLAG, "true");
    }

    return res.data;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
      localStorage.removeItem(AUTH_FLAG);
      setUser(null);
    }
  };

  const value = useMemo(
    () => ({
      user,
      loading,
      isAuthenticated: !!user,
      register,
      login,
      logout,
      fetchMe,
    }),
    [user, loading],
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