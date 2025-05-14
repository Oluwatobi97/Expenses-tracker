import React, { createContext, useContext, useState, useEffect } from "react";
import {
  User,
  LoginCredentials,
  RegisterCredentials,
  AuthContextType,
} from "../types/auth";

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
      // Get stored users
      const storedUsers = localStorage.getItem("users");
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

      // Find user by email
      const user = users.find((u) => u.email === credentials.email);
      if (!user) {
        throw new Error("User not found");
      }

      // Verify password
      if (user.password !== credentials.password) {
        throw new Error("Invalid password");
      }

      // Remove password before storing in state
      const { password, ...userWithoutPassword } = user;
      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (credentials: RegisterCredentials) => {
    try {
      // Get stored users
      const storedUsers = localStorage.getItem("users");
      const users: User[] = storedUsers ? JSON.parse(storedUsers) : [];

      // Check if user already exists
      if (users.some((u) => u.email === credentials.email)) {
        throw new Error("User already exists");
      }

      // Create new user
      const newUser: User = {
        id: Date.now().toString(),
        email: credentials.email,
        name: credentials.name,
        password: credentials.password,
      };

      // Save user
      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      // Remove password before storing in state
      const { password, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
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
