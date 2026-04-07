/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getMe, loginUser, logoutUser, registerUser } from "../api/auth";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMe = async () => {
    try {
      const res = await getMe();
      setUser(res.data.user);
      return res.data.user;
    } catch (err) {
      if (!err.response) {
        console.error("Backend server is not running");
      } else if (err.response?.status !== 401) {
        console.error("fetchMe error:", err);
      }

      setUser(null);
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  const register = async (formData) => {
    const res = await registerUser(formData);
    setUser(res.data.user);
    return res.data;
  };

  const login = async (formData) => {
    const res = await loginUser(formData);
    setUser(res.data.user);
    return res.data;
  };

  const logout = async () => {
    try {
      await logoutUser();
    } finally {
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
    [user, loading]
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