import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTransactions } from "../context/TransactionContext";
import { FaPlus } from "react-icons/fa";
import { Notification } from "../types/index.js";
import TransactionForm from "./TransactionForm";
// import BlockedUserCard from "./BlockedUserCard";

export const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    transactions,
    loading,
    error,
    totals,
    dailyTotals,
    monthlyTotals,
    currency,
    setCurrency,
    convertAmount,
  } = useTransactions();
  const [showModal, setShowModal] = useState(false);
  const [userStatus, setUserStatus] = useState<{ active: boolean } | null>(
    null
  );
  const [checkingStatus, setCheckingStatus] = useState(true);
  // Remove the unused newTransaction and setNewTransaction state
  const [convertedAmounts, setConvertedAmounts] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
  });

  const [convertedDailyAmounts, setConvertedDailyAmounts] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
  });

  const [convertedMonthlyAmounts, setConvertedMonthlyAmounts] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    savings: 0,
  });

  // Notification state for blocked users
  const [notificationMessage, setNotificationMessage] = useState("");
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);

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

  useEffect(() => {
    if (!user) {
      navigate("/login");
    } else {
      checkUserStatus();
    }
  }, [user, navigate]);

  useEffect(() => {
    if (userStatus && userStatus.active === false) {
      logout();
      navigate("/login");
    }
  }, [userStatus, logout, navigate]);

  useEffect(() => {
    const updateConvertedAmounts = async () => {
      const newAmounts = {
        balance: await convertAmount(totals.balance, "NGN", currency),
        income: await convertAmount(totals.income, "NGN", currency),
        expenses: await convertAmount(totals.expenses, "NGN", currency),
        savings: await convertAmount(totals.savings, "NGN", currency),
      };
      setConvertedAmounts(newAmounts);

      const newDailyAmounts = {
        balance: await convertAmount(dailyTotals.balance, "NGN", currency),
        income: await convertAmount(dailyTotals.income, "NGN", currency),
        expenses: await convertAmount(dailyTotals.expenses, "NGN", currency),
        savings: await convertAmount(dailyTotals.savings, "NGN", currency),
      };
      setConvertedDailyAmounts(newDailyAmounts);

      const newMonthlyAmounts = {
        balance: await convertAmount(monthlyTotals.balance, "NGN", currency),
        income: await convertAmount(monthlyTotals.income, "NGN", currency),
        expenses: await convertAmount(monthlyTotals.expenses, "NGN", currency),
        savings: await convertAmount(monthlyTotals.savings, "NGN", currency),
      };
      setConvertedMonthlyAmounts(newMonthlyAmounts);
    };

    updateConvertedAmounts();
  }, [totals, dailyTotals, monthlyTotals, currency, convertAmount]);

  // Fetch notifications for blocked user
  useEffect(() => {
    if (user && userStatus && !userStatus.active) {
      setNotifLoading(true);
      fetch(`/api/notifications/user/${user.id}`)
        .then((res) => res.json())
        .then((data) => setNotifications(data))
        .catch(() => setNotifications([]))
        .finally(() => setNotifLoading(false));
    }
  }, [user, userStatus]);

  // Handle notification form submit
  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotifLoading(true);
    setNotifError(null);
    setNotifSuccess(null);
    try {
      const res = await fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: Number(user?.id),
          message: notificationMessage,
        }),
      });
      if (!res.ok) throw new Error("Failed to send notification");
      setNotifSuccess("Message sent to admin.");
      setNotificationMessage("");
      // Refresh notifications, but don't treat as a send error if this fails
      fetch(`/api/notifications/user/${user?.id}`)
        .then((notifRes) => notifRes.json())
        .then((data) => setNotifications(data))
        .catch(() => {}); // Ignore errors here
    } catch (err) {
      setNotifError("Failed to send message. Try again.");
    } finally {
      setNotifLoading(false);
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
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16 flex flex-col items-center justify-center">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 max-w-md w-full mt-12">
          <h2 className="text-2xl font-bold text-red-600 mb-4 text-center">
            Account Suspended
          </h2>
          <p className="mb-6 text-gray-700 dark:text-gray-300 text-center">
            Your account has been blocked. If you believe this is a mistake, you
            can send a message to the admin below.
          </p>
          <form onSubmit={handleNotificationSubmit} className="mb-4">
            <textarea
              className="w-full p-2 border border-gray-300 rounded mb-2 dark:bg-gray-700 dark:text-white"
              rows={3}
              placeholder="Type your message to admin..."
              value={notificationMessage}
              onChange={(e) => setNotificationMessage(e.target.value)}
              required
              disabled={notifLoading}
            />
            <button
              type="submit"
              className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 transition-colors"
              disabled={notifLoading || !notificationMessage.trim()}
            >
              {notifLoading ? "Sending..." : "Send Message"}
            </button>
            {notifError && (
              <div className="text-red-500 mt-2 text-center">{notifError}</div>
            )}
            {notifSuccess && (
              <div className="text-green-600 mt-2 text-center">
                {notifSuccess}
              </div>
            )}
          </form>
          <div>
            <h3 className="text-lg font-semibold mb-2">
              Your Messages & Admin Replies
            </h3>
            {notifLoading ? (
              <div>Loading...</div>
            ) : notifications.length === 0 ? (
              <div className="text-gray-500">No messages yet.</div>
            ) : (
              <ul className="space-y-3">
                {notifications.map((notif) => (
                  <li
                    key={notif.id}
                    className="border rounded p-3 bg-gray-50 dark:bg-gray-700"
                  >
                    <div className="mb-1 text-gray-800 dark:text-gray-200">
                      <span className="font-semibold">You:</span>{" "}
                      {notif.message}
                    </div>
                    {notif.reply && (
                      <div className="mt-1 text-green-700 dark:text-green-400">
                        <span className="font-semibold">Admin reply:</span>{" "}
                        {notif.reply}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      Sent: {new Date(notif.created_at).toLocaleString()}
                      {notif.replied_at && (
                        <span>
                          {" "}
                          | Replied:{" "}
                          {new Date(notif.replied_at).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    );
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

        {/* Daily Summary Cards */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Today's Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Today's Income
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {getCurrencySymbol(currency)}
                {convertedDailyAmounts.income.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Today's Expenses
              </h3>
              <p className="text-2xl font-bold text-red-600">
                {getCurrencySymbol(currency)}
                {convertedDailyAmounts.expenses.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Today's Savings
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {getCurrencySymbol(currency)}
                {convertedDailyAmounts.savings.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Today's Balance
              </h3>
              <p
                className={`text-2xl font-bold ${
                  convertedDailyAmounts.balance >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {getCurrencySymbol(currency)}
                {convertedDailyAmounts.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Monthly Summary Cards */}
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            This Month's Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Monthly Income
              </h3>
              <p className="text-2xl font-bold text-green-600">
                {getCurrencySymbol(currency)}
                {convertedMonthlyAmounts.income.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Monthly Expenses
              </h3>
              <p className="text-2xl font-bold text-red-600">
                {getCurrencySymbol(currency)}
                {convertedMonthlyAmounts.expenses.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Monthly Savings
              </h3>
              <p className="text-2xl font-bold text-blue-600">
                {getCurrencySymbol(currency)}
                {convertedMonthlyAmounts.savings.toFixed(2)}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Monthly Balance
              </h3>
              <p
                className={`text-2xl font-bold ${
                  convertedMonthlyAmounts.balance >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {getCurrencySymbol(currency)}
                {convertedMonthlyAmounts.balance.toFixed(2)}
              </p>
            </div>
          </div>
        </div>

        {/* Limit Alerts Section */}
        {notifications.length > 0 && (
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              ⚠️ Spending Limit Alerts
            </h2>
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
              {notifications.map((notification) => (
                <div key={notification.id} className="mb-3 last:mb-0">
                  <p className="text-yellow-800 dark:text-yellow-200">
                    {notification.message}
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-400 mt-1">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
              <div className="mt-4">
                <Link
                  to="/settings"
                  className="text-sm text-yellow-800 dark:text-yellow-200 underline hover:no-underline"
                >
                  Manage your spending limits →
                </Link>
              </div>
            </div>
          </div>
        )}

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
      {showModal && <TransactionForm onClose={() => setShowModal(false)} />}
    </div>
  );
};
