// import { createContext, useContext, useEffect, useState } from "react";
// import {
//   changePasswordRequest,
//   getMeRequest,
//   loginRequest,
//   registerRequest,
// } from "../api/auth";

// const AuthContext = createContext();

// const getStoredUser = () => {
//   const savedUser = localStorage.getItem("authUser");
//   return savedUser ? JSON.parse(savedUser) : null;
// };

// export const AuthProvider = ({ children }) => {
//   const [user, setUser] = useState(getStoredUser());
//   const [loading, setLoading] = useState(false);
//   const [authChecked, setAuthChecked] = useState(false);

//   useEffect(() => {
//     if (user) {
//       localStorage.setItem("authUser", JSON.stringify(user));
//     } else {
//       localStorage.removeItem("authUser");
//     }
//   }, [user]);

//   useEffect(() => {
//     const verifyUser = async () => {
//       const savedUser = getStoredUser();

//       if (!savedUser?.token) {
//         setAuthChecked(true);
//         return;
//       }

//       try {
//         const { data } = await getMeRequest(savedUser.token);

//         setUser({
//           ...savedUser,
//           ...data,
//           token: savedUser.token,
//         });
//       } catch (error) {
//         setUser(null);
//         localStorage.removeItem("authUser");
//       } finally {
//         setAuthChecked(true);
//       }
//     };

//     verifyUser();
//   }, []);

//   const register = async (formData) => {
//     setLoading(true);

//     try {
//       const { data } = await registerRequest(formData);
//       return {
//         success: true,
//         message:
//           data?.message ||
//           "Registration successful. Please wait for admin verification.",
//       };
//     } catch (error) {
//       if (!error.response) {
//         return {
//           success: false,
//           message:
//             "Cannot connect to server. Please make sure backend is running on http://localhost:5000",
//         };
//       }

//       return {
//         success: false,
//         message: error.response?.data?.message || "Registration failed",
//       };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const login = async (formData) => {
//     setLoading(true);

//     try {
//       const { data } = await loginRequest(formData);
//       setUser(data);
//       return { success: true };
//     } catch (error) {
//       if (!error.response) {
//         return {
//           success: false,
//           message:
//             "Cannot connect to server. Please make sure backend is running on http://localhost:5000",
//         };
//       }

//       return {
//         success: false,
//         message: error.response?.data?.message || "Login failed",
//       };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const changePassword = async (formData) => {
//     setLoading(true);

//     try {
//       const { data } = await changePasswordRequest(formData);

//       return {
//         success: true,
//         message: data?.message || "Password changed successfully",
//       };
//     } catch (error) {
//       if (!error.response) {
//         return {
//           success: false,
//           message:
//             "Cannot connect to server. Please make sure backend is running on http://localhost:5000",
//         };
//       }

//       return {
//         success: false,
//         message: error.response?.data?.message || "Password change failed",
//       };
//     } finally {
//       setLoading(false);
//     }
//   };

//   const logout = () => {
//     setUser(null);
//     localStorage.removeItem("authUser");
//   };

//   const canViewTeam = ["superadmin", "admin"].includes(user?.role);

//   return (
//     <AuthContext.Provider
//       value={{
//         user,
//         loading,
//         authChecked,
//         isAuthenticated: !!user?.token,
//         canViewTeam,
//         register,
//         login,
//         changePassword,
//         logout,
//       }}
//     >
//       {children}
//     </AuthContext.Provider>
//   );
// };

// export const useAuth = () => useContext(AuthContext);


import { createContext, useContext, useEffect, useState } from "react";
import {
  changePasswordRequest,
  forgotPasswordRequest,
  getMeRequest,
  loginRequest,
  registerRequest,
} from "../api/auth";

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
          data?.message ||
          "Registration successful. Please wait for admin verification.",
      };
    } catch (error) {
      if (!error.response) {
        return {
          success: false,
          message:
            "Cannot connect to server. Please make sure backend is running on http://localhost:5000",
        };
      }

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
      if (!error.response) {
        return {
          success: false,
          message:
            "Cannot connect to server. Please make sure backend is running on http://localhost:5000",
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || "Login failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async (formData) => {
    setLoading(true);

    try {
      const { data } = await changePasswordRequest(formData);

      return {
        success: true,
        message: data?.message || "Password changed successfully",
      };
    } catch (error) {
      if (!error.response) {
        return {
          success: false,
          message:
            "Cannot connect to server. Please make sure backend is running on http://localhost:5000",
        };
      }

      return {
        success: false,
        message: error.response?.data?.message || "Password change failed",
      };
    } finally {
      setLoading(false);
    }
  };

  const forgotPassword = async (formData) => {
    setLoading(true);

    try {
      const { data } = await forgotPasswordRequest(formData);

      return {
        success: true,
        message:
          data?.message ||
          "Your request has been sent to superadmin successfully",
      };
    } catch (error) {
      if (!error.response) {
        return {
          success: false,
          message:
            "Cannot connect to server. Please make sure backend is running on http://localhost:5000",
        };
      }

      return {
        success: false,
        message:
          error.response?.data?.message || "Failed to send request to superadmin",
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
        changePassword,
        forgotPassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);