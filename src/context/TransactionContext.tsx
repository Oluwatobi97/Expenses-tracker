import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Transaction, Category, TransactionType } from "../types";

interface TransactionContextType {
  transactions: Transaction[];
  categories: Category[];
  addTransaction: (transaction: Omit<Transaction, "id">) => void;
  editTransaction: (id: string, transaction: Omit<Transaction, "id">) => void;
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

const defaultCategories: Category[] = [
  { id: "1", name: "Food", type: "expense" },
  { id: "2", name: "Subscriptions", type: "expense" },
  { id: "3", name: "Housing", type: "expense" },
  { id: "4", name: "Transport", type: "expense" },
  { id: "5", name: "Entertainment", type: "expense" },
  { id: "6", name: "Other", type: "expense" },
  { id: "7", name: "Salary", type: "income" },
  { id: "8", name: "Freelance", type: "income" },
  { id: "9", name: "Investments", type: "income" },
  { id: "2", name: "Clothing", type: "expense" },
  { id: "3", name: "Transport", type: "expense" },
  { id: "4", name: "Salary", type: "income" },
  { id: "5", name: "Freelance", type: "income" },
  { id: "6", name: "Investments", type: "income" },
];

export function TransactionProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem("transactions");
    return saved ? JSON.parse(saved) : [];
  });
  const [categories] = useState<Category[]>(defaultCategories);

  useEffect(() => {
    localStorage.setItem("transactions", JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, "id">) => {
    const newTransaction = {
      ...transaction,
      id: crypto.randomUUID(),
    };
    setTransactions([...transactions, newTransaction]);
  };

  const editTransaction = (
    id: string,
    transaction: Omit<Transaction, "id">
  ) => {
    setTransactions(
      transactions.map((t) => (t.id === id ? { ...transaction, id } : t))
    );
  };

  const deleteTransaction = (id: string) => {
    setTransactions(transactions.filter((t) => t.id !== id));
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
