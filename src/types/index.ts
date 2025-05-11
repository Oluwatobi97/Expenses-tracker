export type TransactionType = "income" | "expense";

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
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  transactions: Transaction[];
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
  { id: "9", name: "Healthcare", type: "expense" },
  { id: "10", name: "Shopping", type: "expense" },
];
