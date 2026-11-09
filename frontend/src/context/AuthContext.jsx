
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";
import axios from "axios";

const AuthContext = createContext(null);

const API_URL = import.meta.env.VITE_API_BASE_URL || "/api";

const TOKEN_KEY = "estateiq_token";
const USER_KEY = "estateiq_user";

export function AuthProvider({ children }) {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore saved session
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);

      if (savedToken && savedUser) {
        const parsedUser = JSON.parse(savedUser);

        if (parsedUser && parsedUser.email) {
          setToken(savedToken);
          setUser(parsedUser);
        } else {
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem(USER_KEY);
        }
      }
    } catch {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
    } finally {
      setLoading(false);
    }
  }, []);

  // Login
  const login = useCallback(
    async (credentials) => {
      try {
        const response = await axios.post(
          `${API_URL}/auth/login`,
          credentials,
          { timeout: 15000 }
        );

        const data = response.data;

        const accessToken = data.access_token;
        const userData = data.user;

        if (!accessToken || !userData) {
          throw new Error(
            "Invalid login response from the server."
          );
        }

        const normalizedUser = {
          id: userData.id,
          name:
            userData.full_name ||
            userData.name ||
            userData.email ||
            "User",
          email: userData.email,
          role: userData.role || "sales_executive",
        };

        localStorage.setItem(TOKEN_KEY, accessToken);
        localStorage.setItem(
          USER_KEY,
          JSON.stringify(normalizedUser)
        );

        setToken(accessToken);
        setUser(normalizedUser);

        navigate("/", { replace: true });

        return {
          success: true,
          user: normalizedUser,
        };
      } catch (error) {
        const message =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          error.message ||
          "Login failed. Please try again.";

        throw new Error(
          typeof message === "string"
            ? message
            : "Please check your login credentials."
        );
      }
    },
    [navigate]
  );

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);

    setToken(null);
    setUser(null);

    navigate("/login", { replace: true });
  }, [navigate]);

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: Boolean(user && token),
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Access authentication throughout the application
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider."
    );
  }

  return context;
}
