import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { Transaction } from "../types/index.js";
import { useAuth } from "./AuthContext.js";

interface TransactionContextType {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  addTransaction: (
    transaction: Omit<Transaction, "id" | "created_at" | "updated_at">
  ) => Promise<void>;
  updateTransaction: (
    id: string,
    updates: Partial<
      Omit<Transaction, "id" | "created_at" | "updated_at" | "user_id">
    >
  ) => Promise<void>;
  deleteTransaction: (id: string) => Promise<void>;
  refreshTransactions: () => Promise<void>;
  fetchTransactions: (userId: string) => Promise<void>;
  totals: {
    income: number;
    expenses: number;
    savings: number;
    balance: number;
  };
  dailyTotals: {
    income: number;
    expenses: number;
    savings: number;
    balance: number;
  };
  monthlyTotals: {
    income: number;
    expenses: number;
    savings: number;
    balance: number;
  };
  currency: string;
  setCurrency: (currency: string) => void;
  convertAmount: (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ) => Promise<number>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(
  undefined
);

export const TransactionProvider = ({ children }: { children: ReactNode }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currency, setCurrency] = useState("NGN"); // Default to Naira
  const { user } = useAuth();

  const API_BASE = import.meta.env.VITE_API_URL || "/api";

  const calculateTotals = (transactions: Transaction[]) => {
    return transactions.reduce(
      (acc, transaction) => {
        const amount = Number(transaction.amount);
        if (transaction.type === "income") {
          acc.income += amount;
        } else if (transaction.type === "expense") {
          acc.expenses += amount;
        } else if (transaction.type === "savings") {
          acc.savings += amount;
        }
        acc.balance = acc.income - acc.expenses - acc.savings;
        return acc;
      },
      { income: 0, expenses: 0, savings: 0, balance: 0 }
    );
  };

  const calculateDailyTotals = (transactions: Transaction[]) => {
    const today = new Date().toISOString().split("T")[0];
    const todayTransactions = transactions.filter((transaction) => {
      if (!transaction.created_at) return false;
      const dateObj = new Date(transaction.created_at);
      if (isNaN(dateObj.getTime())) return false;
      const transactionDate = dateObj.toISOString().split("T")[0];
      return transactionDate === today;
    });

    return calculateTotals(todayTransactions);
  };

  const calculateMonthlyTotals = (transactions: Transaction[]) => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    const monthlyTransactions = transactions.filter((transaction) => {
      if (!transaction.created_at) return false;
      const dateObj = new Date(transaction.created_at);
      if (isNaN(dateObj.getTime())) return false;
      return (
        dateObj.getMonth() === currentMonth &&
        dateObj.getFullYear() === currentYear
      );
    });

    return calculateTotals(monthlyTransactions);
  };

  const convertAmount = async (
    amount: number,
    fromCurrency: string,
    toCurrency: string
  ) => {
    try {
      const response = await fetch(
        `https://api.exchangerate-api.com/v4/latest/${fromCurrency}`
      );
      const data = await response.json();
      const rate = data.rates[toCurrency];
      return amount * rate;
    } catch (error) {
      console.error("Error converting currency:", error);
      return amount; // Return original amount if conversion fails
    }
  };

  const fetchTransactions = async (userId: string) => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/transactions/${userId}`);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to fetch transactions");
      }

      const data = await response.json();
      setTransactions(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchTransactions(user.id);
    }
  }, [user?.id]);

  const addTransaction = async (
    transaction: Omit<Transaction, "id" | "created_at" | "updated_at">
  ) => {
    if (!user?.id) {
      throw new Error("User must be logged in to add transactions");
    }

    try {
      const response = await fetch(`${API_BASE}/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...transaction,
          user_id: user.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to add transaction");
      }

      const newTransaction = await response.json();
      setTransactions((prev) => [...prev, newTransaction]);
      setError(null);

      // Refresh transactions to get updated totals for limit checking
      await refreshTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const updateTransaction = async (
    id: string,
    updates: Partial<
      Omit<Transaction, "id" | "created_at" | "updated_at" | "user_id">
    >
  ) => {
    try {
      const response = await fetch(`${API_BASE}/transactions/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to update transaction");
      }
      const updated = await response.json();
      setTransactions((prev) =>
        prev.map((tx) => (tx.id === id ? { ...tx, ...updated } : tx))
      );
      setError(null);
      await refreshTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const deleteTransaction = async (id: string) => {
    try {
      const response = await fetch(`${API_BASE}/transactions/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "Failed to delete transaction");
      }
      setTransactions((prev) => prev.filter((tx) => tx.id !== id));
      setError(null);
      await refreshTransactions();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      throw err;
    }
  };

  const refreshTransactions = async () => {
    if (user?.id) {
      await fetchTransactions(user.id);
    }
  };

  const totals = calculateTotals(transactions);
  const dailyTotals = calculateDailyTotals(transactions);
  const monthlyTotals = calculateMonthlyTotals(transactions);

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loading,
        error,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        refreshTransactions,
        fetchTransactions,
        totals,
        dailyTotals,
        monthlyTotals,
        currency,
        setCurrency,
        convertAmount,
      }}
    >
      {children}
    </TransactionContext.Provider>
  );
};

export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (context === undefined) {
    throw new Error(
      "useTransactions must be used within a TransactionProvider"
    );
  }
  return context;
};
