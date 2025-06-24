export * from "./transaction.js";

export interface Category {
  id: string;
  name: string;
  type: "income" | "expense" | "savings";
}

export const defaultCategories: Category[] = [
  { id: "1", name: "Salary", type: "income" },
  { id: "2", name: "Freelance", type: "income" },
  { id: "3", name: "Investments", type: "income" },
  { id: "4", name: "Food", type: "expense" },
  { id: "5", name: "Transportation", type: "expense" },
  { id: "6", name: "Housing", type: "expense" },
  { id: "7", name: "Utilities", type: "expense" },
  { id: "8", name: "Entertainment", type: "expense" },
  { id: "9", name: "Emergency Fund", type: "savings" },
  { id: "10", name: "Retirement", type: "savings" },
  { id: "11", name: "Vacation Fund", type: "savings" },
];

export interface Transaction {
  id: string;
  user_id: string;
  type: "income" | "expense" | "savings";
  amount: number;
  date: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials extends LoginCredentials {
  name: string;
}

export interface AuthContextType {
  user: User | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
}

export interface TransactionContextType {
  transactions: Transaction[];
  addTransaction: (
    transaction: Omit<Transaction, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  deleteTransaction?: (id: string) => Promise<void>;
  loading: boolean;
  error: string | null;
}
