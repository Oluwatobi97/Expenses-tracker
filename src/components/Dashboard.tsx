import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTransactions } from "../context/TransactionContext";
import { FaPlus } from "react-icons/fa";
// import BlockedUserCard from "./BlockedUserCard";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    transactions,
    loading,
    error,
    addTransaction,
    totals,
    currency,
    setCurrency,
    convertAmount,
  } = useTransactions();
  const [showModal, setShowModal] = useState(false);
  const [userStatus, setUserStatus] = useState<{ active: boolean } | null>(
    null
  );
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [newTransaction, setNewTransaction] = useState({
    type: "expense",
    amount: "",
    description: "",
    date: new Date().toISOString().split("T")[0],
  });
  const [convertedAmounts, setConvertedAmounts] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
  });

  // Check user status
  const checkUserStatus = async () => {
    try {
      const token =
        user?.token || localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user") || "{}").token
          : null;

      if (!token) {
        setUserStatus({ active: true }); // Default to active if no token
        return;
      }

      const response = await fetch(`/api/admin/users/${user?.id}/status`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUserStatus(data);
      } else {
        // If we can't check status, assume user is active
        setUserStatus({ active: true });
      }
    } catch (error) {
      console.error("Error checking user status:", error);
      setUserStatus({ active: true }); // Default to active on error
    } finally {
      setCheckingStatus(false);
    }
  };

  // Calculate totals
  const monthlyTotals = transactions.reduce(
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

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      checkUserStatus();
    }
  }, [user, navigate]);

  useEffect(() => {
    const updateConvertedAmounts = async () => {
      const newAmounts = {
        balance: await convertAmount(totals.balance, "NGN", currency),
        income: await convertAmount(totals.income, "NGN", currency),
        expenses: await convertAmount(totals.expenses, "NGN", currency),
        savings: await convertAmount(totals.savings, "NGN", currency),
      };
      setConvertedAmounts(newAmounts);
    };

    updateConvertedAmounts();
  }, [totals, currency, convertAmount]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addTransaction({
        ...newTransaction,
        user_id: user?.id || "",
        amount: Number(newTransaction.amount),
        type: newTransaction.type as "income" | "expense" | "savings",
        date: new Date().toISOString(),
      });
      setShowModal(false);
      setNewTransaction({
        amount: "",
        description: "",
        type: "expense",
        date: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Error adding transaction:", error);
    }
  };

  const getCurrencySymbol = (currency: string) => {
    switch (currency) {
      case "USD":
        return "$";
      case "EUR":
        return "€";
      case "GBP":
        return "£";
      default:
        return "₦";
    }
  };

  // Show loading while checking user status
  if (checkingStatus) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
        </div>
      </div>
    );
  }

  // Show blocked user card if user is not active
  if (userStatus && !userStatus.active) {
    // return <BlockedUserCard />;
    return <div>Account suspended</div>;
  }

  if (loading) return <div className="text-center p-4">Loading...</div>;
  if (error) return <div className="text-center text-red-500 p-4">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Message */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <svg
              className="w-6 h-6 text-gray-600 dark:text-gray-300"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <h1 className="text-sm md:text-2xl lg:text-2xl text-black dark:text-white font-bold">
              Welcome, {user?.name}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
            >
              <FaPlus className="mr-2" />
              Add Transaction
            </button>
          </div>
        </div>

        <div className="mb-4">
          <select
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
          >
            <option value="NGN">Naira (₦)</option>
            <option value="USD">US Dollar ($)</option>
            <option value="EUR">Euro (€)</option>
            <option value="GBP">British Pound (£)</option>
          </select>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Total Balance
            </h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {getCurrencySymbol(currency)}
              {convertedAmounts.balance.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Total Income
            </h3>
            <p className="text-3xl font-bold text-green-600 dark:text-green-400">
              {getCurrencySymbol(currency)}
              {convertedAmounts.income.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Total Expenses
            </h3>
            <p className="text-3xl font-bold text-red-600 dark:text-red-400">
              {getCurrencySymbol(currency)}
              {convertedAmounts.expenses.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Total Savings
            </h3>
            <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {getCurrencySymbol(currency)}
              {convertedAmounts.savings.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Total Income
            </h3>
            <p className="text-2xl font-bold text-green-600">
              {getCurrencySymbol(currency)}
              {monthlyTotals.income.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Total Expenses
            </h3>
            <p className="text-2xl font-bold text-red-600">
              {getCurrencySymbol(currency)}
              {monthlyTotals.expenses.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Total Savings
            </h3>
            <p className="text-2xl font-bold text-blue-600">
              {getCurrencySymbol(currency)}
              {monthlyTotals.savings.toFixed(2)}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
              Total Balance
            </h3>
            <p
              className={`text-2xl font-bold ${
                monthlyTotals.balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {getCurrencySymbol(currency)}
              {monthlyTotals.balance.toFixed(2)}
            </p>
          </div>
        </div>

        {/* Transactions List */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900 dark:text-white">
                Recent Transactions
              </h2>
              <button
                onClick={() => setShowModal(true)}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
              >
                <FaPlus className="mr-2" />
                Add Transaction
              </button>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Description
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Type
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <span
                        className={
                          transaction.type === "income"
                            ? "text-green-600 dark:text-green-400"
                            : transaction.type === "savings"
                            ? "text-blue-600 dark:text-blue-400"
                            : "text-red-600 dark:text-red-400"
                        }
                      >
                        {getCurrencySymbol(currency)}
                        {Number(transaction.amount).toFixed(2)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {transaction.type}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* Add Transaction Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              Add New Transaction
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <select
                  value={newTransaction.type}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      type: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                  <option value="savings">Savings</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  value={newTransaction.amount}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      amount: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  value={newTransaction.description}
                  onChange={(e) =>
                    setNewTransaction({
                      ...newTransaction,
                      description: e.target.value,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white"
                  required
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
