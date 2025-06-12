import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthContextType,
} from "../types/auth.js";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = async (credentials: LoginCredentials) => {
    try {
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
      };

      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
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

      if (!response.ok) {
        // Attempt to read error message from backend response
        const errorData = await response
          .json()
          .catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || response.statusText);
      }

      const userData = await response.json();
      setUser(userData);
      localStorage.setItem("user", JSON.stringify(userData));
    } catch (error) {
      console.error("Registration error:", error);
      throw error instanceof Error ? error : new Error(String(error));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout }}>
      {children}
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
