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
  refreshTransactions: () => Promise<void>;
  fetchTransactions: (userId: string) => Promise<void>;
  totals: {
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
        acc.balance = acc.income - acc.expenses;
        return acc;
      },
      { income: 0, expenses: 0, savings: 0, balance: 0 }
    );
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
  totals.balance = totals.income - totals.expenses;

  return (
    <TransactionContext.Provider
      value={{
        transactions,
        loading,
        error,
        addTransaction,
        refreshTransactions,
        fetchTransactions,
        totals,
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
