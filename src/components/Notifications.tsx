import React from "react";
import { useTransactions } from "../context/TransactionContext.js";
import { getMonthlyTransactions } from "../utils/transactions";
import { AlertTriangle, Info } from "lucide-react";

interface Notification {
  type: "warning" | "info";
  message: string;
  icon: JSX.Element;
}

const Notifications: React.FC = () => {
  const { transactions } = useTransactions();

  const monthlyData = getMonthlyTransactions(
    transactions,
    `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(
      2,
      "0"
    )}`
  );

  const notifications: Notification[] = [];

  // Check monthly savings goal
  const savingsGoal = 1000; // Example goal
  if (monthlyData.savings < savingsGoal) {
    notifications.push({
      type: "warning",
      message: `You're below your monthly savings goal of ${savingsGoal}. Current savings: ${monthlyData.savings}`,
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    });
  }

  // Check high expenses
  if (monthlyData.expenses > monthlyData.income * 0.8) {
    notifications.push({
      type: "warning",
      message: "Your expenses are high this month. Consider reducing spending.",
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
    });
  }

  // Check low savings
  if (monthlyData.savings < monthlyData.income * 0.1) {
    notifications.push({
      type: "info",
      message: "Consider increasing your savings rate this month.",
      icon: <Info className="h-5 w-5 text-blue-500" />,
    });
  }

  // Calculate daily expenses
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dailyExpenses = transactions
    .filter(
      (t) =>
        t.type === "expense" && new Date(t.date).getTime() >= today.getTime()
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Calculate weekly expenses
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  const weeklyExpenses = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        new Date(t.date).getTime() >= weekStart.getTime()
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Calculate monthly expenses
  const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const monthlyExpenses = transactions
    .filter(
      (t) =>
        t.type === "expense" &&
        new Date(t.date).getTime() >= monthStart.getTime()
    )
    .reduce((sum, t) => sum + Number(t.amount), 0);

  // Define thresholds
  const DAILY_THRESHOLD = 100;
  const WEEKLY_THRESHOLD = 500;
  const MONTHLY_THRESHOLD = 2000;

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">
        Expense Alerts
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${
            dailyExpenses > DAILY_THRESHOLD ? "border-l-4 border-red-500" : ""
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Daily Expenses
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${dailyExpenses.toFixed(2)}
          </p>
          {dailyExpenses > DAILY_THRESHOLD && (
            <p className="text-red-600 mt-2">
              ⚠️ Daily expenses exceed ${DAILY_THRESHOLD}
            </p>
          )}
        </div>

        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${
            weeklyExpenses > WEEKLY_THRESHOLD ? "border-l-4 border-red-500" : ""
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Weekly Expenses
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${weeklyExpenses.toFixed(2)}
          </p>
          {weeklyExpenses > WEEKLY_THRESHOLD && (
            <p className="text-red-600 mt-2">
              ⚠️ Weekly expenses exceed ${WEEKLY_THRESHOLD}
            </p>
          )}
        </div>

        <div
          className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 ${
            monthlyExpenses > MONTHLY_THRESHOLD
              ? "border-l-4 border-red-500"
              : ""
          }`}
        >
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
            Monthly Expenses
          </h3>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            ${monthlyExpenses.toFixed(2)}
          </p>
          {monthlyExpenses > MONTHLY_THRESHOLD && (
            <p className="text-red-600 mt-2">
              ⚠️ Monthly expenses exceed ${MONTHLY_THRESHOLD}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Notifications;
