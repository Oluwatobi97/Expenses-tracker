import React from "react";
import { useTransactions } from "../context/TransactionContext";
import { getMonthlyTransactions } from "../utils/transactions";
import { Bell, AlertTriangle, Info } from "lucide-react";

interface Notification {
  type: "warning" | "info";
  message: string;
  icon: JSX.Element;
}

const Notifications: React.FC = () => {
  const { transactions } = useTransactions();
  const currentMonth = new Date().toLocaleString("default", {
    month: "long",
    year: "numeric",
  });

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

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <Bell className="h-6 w-6 text-gray-900 dark:text-white" />
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Notifications
        </h2>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              No notifications for {currentMonth}
            </p>
          </div>
        ) : (
          notifications.map((notification, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 flex items-start space-x-4"
            >
              {notification.icon}
              <p className="text-gray-900 dark:text-white">
                {notification.message}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default Notifications;
