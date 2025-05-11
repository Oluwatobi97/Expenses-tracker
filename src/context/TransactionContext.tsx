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
    balance: number;
  };
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

  const getMonthlySummary = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter((t) => {
      const transactionDate = new Date(t.date);
      return (
        transactionDate.getMonth() === currentMonth &&
        transactionDate.getFullYear() === currentYear
      );
    });

    const totalIncome = monthlyTransactions
      .filter((t) => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
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
