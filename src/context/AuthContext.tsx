import { createContext, useContext, useState, useEffect, useRef } from "react";
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthContextType,
} from "../types/auth";
import SubscriptionModal from "../components/SubscriptionModal";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTO_LOGOUT_TIME = 15 * 60 * 1000; // 15 minutes in ms

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const logoutTimer = useRef<NodeJS.Timeout | null>(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  // Helper to clear timer
  const clearLogoutTimer = () => {
    if (logoutTimer.current) {
      clearTimeout(logoutTimer.current);
      logoutTimer.current = null;
    }
  };

  // Set auto-logout timer
  const setAutoLogout = () => {
    clearLogoutTimer();
    logoutTimer.current = setTimeout(() => {
      logout();
      window.location.href = "/login";
    }, AUTO_LOGOUT_TIME);
  };

  const login = async (credentials: LoginCredentials) => {
    try {
      setLoading(true);
      // Use a relative path for API calls
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        // Attempt to read error message from backend response
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || "Invalid credentials");
      }

      const data = await response.json();
      // Store the user data from the response
      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        token: data.token,
        currency: data.user.currency || "NGN", // Default to NGN if not provided
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
      setAutoLogout();
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      setLoading(true);
      // Transform the data to match backend expectations
      const registerData = {
        username: credentials.name,
        email: credentials.email,
        password: credentials.password,
      };

      // Use a relative path for API calls
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(registerData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || response.statusText);
      }

      // Store the user data from the response
      const userData = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        currency: data.user.currency || "NGN", // Default to NGN if not provided
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Registration error:", error);
      throw error instanceof Error ? error : new Error(String(error));
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    clearLogoutTimer();
    setUser(null);
    localStorage.removeItem("user");
  };

  // Optionally, reset timer on user activity
  useEffect(() => {
    if (user) {
      setAutoLogout();
      const resetTimer = () => setAutoLogout();
      window.addEventListener("mousemove", resetTimer);
      window.addEventListener("keydown", resetTimer);
      return () => {
        window.removeEventListener("mousemove", resetTimer);
        window.removeEventListener("keydown", resetTimer);
        clearLogoutTimer();
      };
    }
  }, [user]);

  // Show modal when user logs in
  useEffect(() => {
    if (user) {
      setShowSubscriptionModal(true);
    }
  }, [user]);

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {children}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
