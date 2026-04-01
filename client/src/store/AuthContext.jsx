import { createContext, useContext, useEffect, useState } from "react";
import { getMeRequest, loginRequest, registerRequest } from "../api/auth";

const AuthContext = createContext();

const getStoredUser = () => {
  const savedUser = localStorage.getItem("authUser");
  return savedUser ? JSON.parse(savedUser) : null;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getStoredUser());
  const [loading, setLoading] = useState(false);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    if (user) {
      localStorage.setItem("authUser", JSON.stringify(user));
    } else {
      localStorage.removeItem("authUser");
    }
  }, [user]);

  useEffect(() => {
    const verifyUser = async () => {
      const savedUser = getStoredUser();

      if (!savedUser?.token) {
        setAuthChecked(true);
        return;
      }

      try {
        const { data } = await getMeRequest(savedUser.token);

        setUser({
          ...savedUser,
          ...data,
          token: savedUser.token,
        });
      } catch (error) {
        setUser(null);
        localStorage.removeItem("authUser");
      } finally {
        setAuthChecked(true);
      }
    };

    verifyUser();
  }, []);

  const register = async (formData) => {
  setLoading(true);

  try {
    const { data } = await registerRequest(formData);
    return {
      success: true,
      message:
        data?.message || "Registration successful. Please wait for admin verification.",
    };
  } catch (error) {
    return {
      success: false,
      message: error.response?.data?.message || "Registration failed",
    };
  } finally {
    setLoading(false);
  }
};

  const login = async (formData) => {
    setLoading(true);

    try {
      const { data } = await loginRequest(formData);
      setUser(data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("authUser");
  };

  const canViewTeam = ["superadmin", "admin"].includes(user?.role);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        authChecked,
        isAuthenticated: !!user?.token,
        canViewTeam,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);