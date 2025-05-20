import { useEffect, useState } from "react";
import { useTransactions } from "../context/TransactionContext";

interface Notification {
  id: string;
  type: "success" | "warning" | "info";
  message: string;
  date: string;
}

export default function Notifications() {
  const { transactions } = useTransactions();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    const generateNotifications = () => {
      const newNotifications: Notification[] = [];

      // Get current month's transactions
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      const monthlyTransactions = transactions.filter((t) => {
        const transactionDate = new Date(t.date);
        return (
          transactionDate.getMonth() === currentMonth &&
          transactionDate.getFullYear() === currentYear
        );
      });

      // Calculate monthly totals
      const monthlyIncome = monthlyTransactions
        .filter((t) => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlyExpenses = monthlyTransactions
        .filter((t) => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

      const monthlySavings = monthlyTransactions
        .filter((t) => t.type === "savings")
        .reduce((sum, t) => sum + t.amount, 0);

      // Check if it's the end of the month
      const isEndOfMonth = now.getDate() >= 28;

      if (isEndOfMonth) {
        // Monthly savings goal notification
        const savingsGoal = monthlyIncome * 0.2; // 20% of income as savings goal
        if (monthlySavings < savingsGoal) {
          newNotifications.push({
            id: "savings-warning",
            type: "warning",
            message: `You haven't met your monthly savings goal. Try to save at least ${savingsGoal.toFixed(
              2
            )} next month.`,
            date: new Date().toISOString(),
          });
        } else {
          newNotifications.push({
            id: "savings-success",
            type: "success",
            message: `Great job! You've exceeded your monthly savings goal of ${savingsGoal.toFixed(
              2
            )}.`,
            date: new Date().toISOString(),
          });
        }

        // Monthly expense analysis
        const expenseRatio = monthlyExpenses / monthlyIncome;
        if (expenseRatio > 0.8) {
          newNotifications.push({
            id: "expense-warning",
            type: "warning",
            message:
              "Your expenses are high this month. Consider reducing non-essential spending.",
            date: new Date().toISOString(),
          });
        } else if (expenseRatio < 0.5) {
          newNotifications.push({
            id: "expense-success",
            type: "success",
            message: "Great job keeping your expenses low this month!",
            date: new Date().toISOString(),
          });
        }
      }

      // High expense notification
      const highExpense = monthlyTransactions.find(
        (t) => t.type === "expense" && t.amount > 1000
      );
      if (highExpense) {
        newNotifications.push({
          id: `high-expense-${highExpense.id}`,
          type: "warning",
          message: `High expense detected: ${
            highExpense.description
          } (${highExpense.amount.toFixed(2)})`,
          date: highExpense.date,
        });
      }

      // Low savings notification
      if (monthlySavings < 100) {
        newNotifications.push({
          id: "low-savings",
          type: "warning",
          message:
            "Your savings are low this month. Consider increasing your savings.",
          date: new Date().toISOString(),
        });
      }

      setNotifications(newNotifications);
    };

    generateNotifications();
  }, [transactions]);

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 text-green-800 dark:bg-green-900/20 dark:text-green-200";
      case "warning":
        return "bg-yellow-50 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200";
      case "info":
        return "bg-blue-50 text-blue-800 dark:bg-blue-900/20 dark:text-blue-200";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Notifications</h1>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No notifications at the moment
          </div>
        ) : (
          notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-lg ${getNotificationColor(
                notification.type
              )}`}
            >
              <div className="flex items-start">
                <div className="flex-1">
                  <p className="text-sm font-medium">{notification.message}</p>
                  <p className="text-xs mt-1 opacity-75">
                    {new Date(notification.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
