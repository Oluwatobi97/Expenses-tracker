import { Transaction, User } from "../types/index.js";

const API_URL = "http://localhost:3000/api";

export const api = {
  // Transaction endpoints
  async getTransactions(userId: number): Promise<Transaction[]> {
    const response = await fetch(`${API_URL}/transactions/${userId}`);
    if (!response.ok) {
      throw new Error("Failed to fetch transactions");
    }
    return response.json();
  },

  async createTransaction(
    transaction: Omit<Transaction, "id" | "created_at" | "updated_at">
  ): Promise<Transaction> {
    const response = await fetch(`${API_URL}/transactions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transaction),
    });
    if (!response.ok) {
      throw new Error("Failed to create transaction");
    }
    return response.json();
  },

  // User endpoints
  async createUser(
    user: Omit<User, "id" | "created_at" | "updated_at">
  ): Promise<User> {
    const response = await fetch(`${API_URL}/users`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(user),
    });
    if (!response.ok) {
      throw new Error("Failed to create user");
    }
    return response.json();
  },

  async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      throw new Error("Invalid email or password");
    }
    return response.json();
  },
};
