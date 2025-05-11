export type TransactionType = "income" | "expense";

export interface Transaction {
  id: string;
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
