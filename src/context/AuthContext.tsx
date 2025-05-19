import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface User {
  id: string;
  email: string;
  password: string;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
  resetTimer: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Simple hash function (in a real app, use a proper crypto library)
const hashPassword = (password: string): string => {
  return btoa(password); // Base64 encoding (for demo purposes)
};

// Password validation
const validatePassword = (password: string): string | null => {
  if (password.length < 8) {
    return "Password must be at least 8 characters long";
  }
  if (!/[A-Z]/.test(password)) {
    return "Password must contain at least one uppercase letter";
  }
  if (!/[a-z]/.test(password)) {
    return "Password must contain at least one lowercase letter";
  }
  if (!/[0-9]/.test(password)) {
    return "Password must contain at least one number";
  }
  if (!/[!@#$%^&*]/.test(password)) {
    return "Password must contain at least one special character (!@#$%^&*)";
  }
  return null;
};

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [lastActivity, setLastActivity] = useState<number>(Date.now());

  // Reset the timer on user activity
  const resetTimer = () => {
    setLastActivity(Date.now());
  };

  // Check for inactivity
  useEffect(() => {
    if (!user) return;

    const checkInactivity = () => {
      const now = Date.now();
      if (now - lastActivity > INACTIVITY_TIMEOUT) {
        logout();
      }
    };

    // Add event listeners for user activity
    const events = [
      "mousedown",
      "mousemove",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => {
      window.addEventListener(event, resetTimer);
    });

    // Check every minute
    const interval = setInterval(checkInactivity, 60000);

    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, resetTimer);
      });
      clearInterval(interval);
    };
  }, [user, lastActivity]);

  useEffect(() => {
    // Check for stored user data on mount
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
        setLastActivity(Date.now());
      } catch (error) {
        console.error("Error parsing stored user:", error);
        localStorage.removeItem("user");
      }
    }
  }, []);

  const login = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const hashedPassword = hashPassword(password);
      const foundUser = users.find(
        (u: User) => u.email === email && u.password === hashedPassword
      );

      if (foundUser) {
        const { password: _, ...userWithoutPassword } = foundUser;
        setUser(userWithoutPassword as User);
        localStorage.setItem("user", JSON.stringify(userWithoutPassword));
        setLastActivity(Date.now());
      } else {
        throw new Error("Invalid email or password");
      }
    } catch (error) {
      console.error("Login error:", error);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    try {
      if (!email || !password) {
        throw new Error("Email and password are required");
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        throw new Error("Invalid email format");
      }

      // Validate password
      const passwordError = validatePassword(password);
      if (passwordError) {
        throw new Error(passwordError);
      }

      const users = JSON.parse(localStorage.getItem("users") || "[]");
      const existingUser = users.find((u: User) => u.email === email);

      if (existingUser) {
        throw new Error("An account with this email already exists");
      }

      const hashedPassword = hashPassword(password);
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString(),
      };

      users.push(newUser);
      localStorage.setItem("users", JSON.stringify(users));

      const { password: _, ...userWithoutPassword } = newUser;
      setUser(userWithoutPassword as User);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      setLastActivity(Date.now());
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
    <AuthContext.Provider value={{ user, login, register, logout, resetTimer }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
