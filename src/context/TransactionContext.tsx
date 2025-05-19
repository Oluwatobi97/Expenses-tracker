import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Transaction, Category, defaultCategories } from "../types";
import { useAuth } from "./AuthContext";

interface TransactionContextType {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, "id" | "userId">) => void;
  editTransaction: (
    id: string,
    transaction: Omit<Transaction, "id" | "userId">
  ) => void;
  deleteTransaction: (id: string) => void;
  getMonthlySummary: () => {
    totalIncome: number;
    totalExpenses: number;
    totalSavings: number;
    balance: number;
    savingsRate: number;
  };
  getMonthlyTransactions: () => Transaction[];
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [categories] = useState<Category[]>(defaultCategories);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      const storedTransactions = localStorage.getItem(
        `transactions_${user.id}`
      );
      if (storedTransactions) {
        setTransactions(JSON.parse(storedTransactions));
      }
    } else {
      setTransactions([]);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      localStorage.setItem(
        `transactions_${user.id}`,
        JSON.stringify(transactions)
      );
    }
  }, [transactions, user]);

  const addTransaction = (transaction: Omit<Transaction, "id" | "userId">) => {
    if (!user) return;

    const newTransaction: Transaction = {
      ...transaction,
      id: Math.random().toString(36).substr(2, 9),
      userId: user.id,
    };
    setTransactions((prev) => [...prev, newTransaction]);
  };

  const editTransaction = (
    id: string,
    transaction: Omit<Transaction, "id" | "userId">
  ) => {
    if (!user) return;

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === id ? { ...transaction, id, userId: user.id } : t
      )
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  };

  const getMonthlyTransactions = () => {
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return transactions.filter((transaction) => {
      const transactionDate = new Date(transaction.date);
      return (
        transactionDate >= firstDayOfMonth && transactionDate <= lastDayOfMonth
      );
    });
  };

  const getMonthlySummary = () => {
    const monthlyTransactions = getMonthlyTransactions();

    const totalIncome = monthlyTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalSavings = monthlyTransactions
      .filter((t) => t.type === "savings")
      .reduce((sum, t) => sum + t.amount, 0);

    const balance = totalIncome - totalExpenses - totalSavings;
    const savingsRate =
      totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

    return {
      totalIncome,
      totalExpenses,
      totalSavings,
      balance,
      savingsRate,
    };
  };

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        categories,
        addTransaction,
        editTransaction,
        deleteTransaction,
        getMonthlySummary,
        getMonthlyTransactions,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
}

export function useTransactions() {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error(
      "useTransactions must be used within a TransactionProvider"
    );
  }
  return context;
}
