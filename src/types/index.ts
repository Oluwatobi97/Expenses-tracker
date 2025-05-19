export type TransactionType = "income" | "expense" | "savings";

export interface Transaction {
  id: string;
  userId: string;
  type: TransactionType;
  amount: number;
  date: string;
  category: string;
  description: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactions: Transaction[];
}

export const defaultCategories: Category[] = [
  // Income categories
  { id: "salary", name: "Salary", type: "income", color: "#10B981" },
  { id: "freelance", name: "Freelance", type: "income", color: "#059669" },
  { id: "investments", name: "Investments", type: "income", color: "#047857" },
  {
    id: "other_income",
    name: "Other Income",
    type: "income",
    color: "#065F46",
  },

  // Expense categories
  { id: "food", name: "Food & Dining", type: "expense", color: "#EF4444" },
  {
    id: "transportation",
    name: "Transportation",
    type: "expense",
    color: "#DC2626",
  },
  { id: "housing", name: "Housing", type: "expense", color: "#B91C1C" },
  { id: "utilities", name: "Utilities", type: "expense", color: "#991B1B" },
  {
    id: "entertainment",
    name: "Entertainment",
    type: "expense",
    color: "#7F1D1D",
  },
  { id: "shopping", name: "Shopping", type: "expense", color: "#DC2626" },
  { id: "healthcare", name: "Healthcare", type: "expense", color: "#B91C1C" },
  { id: "education", name: "Education", type: "expense", color: "#991B1B" },
  {
    id: "other_expense",
    name: "Other Expense",
    type: "expense",
    color: "#7F1D1D",
  },

  // Savings categories
  {
    id: "emergency_fund",
    name: "Emergency Fund",
    type: "savings",
    color: "#3B82F6",
  },
  { id: "retirement", name: "Retirement", type: "savings", color: "#2563EB" },
  { id: "vacation", name: "Vacation", type: "savings", color: "#1D4ED8" },
  { id: "investment", name: "Investment", type: "savings", color: "#1E40AF" },
  {
    id: "other_savings",
    name: "Other Savings",
    type: "savings",
    color: "#1E3A8A",
  },
];
