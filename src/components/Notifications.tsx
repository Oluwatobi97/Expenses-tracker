import React from "react";
import { useTransactions } from "../context/TransactionContext";

interface Notification {
  id: string;
  type: "info" | "warning" | "success";
  message: string;
  date: string;
}

export default function Notifications() {
  const { transactions } = useTransactions();
  const [notifications, setNotifications] = React.useState<Notification[]>([]);

  React.useEffect(() => {
    // Generate notifications based on transactions
    const newNotifications: Notification[] = [];

    // Check for high expenses
    const totalExpenses = transactions
      .filter((t) => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalExpenses > 1000) {
      newNotifications.push({
        id: "high-expenses",
        type: "warning",
        message: "Your expenses this month are above $1,000",
        date: new Date().toISOString(),
      });
    }

    // Check for low savings
    const totalSavings = transactions
      .filter((t) => t.type === "savings")
      .reduce((sum, t) => sum + t.amount, 0);

    if (totalSavings < 100) {
      newNotifications.push({
        id: "low-savings",
        type: "warning",
        message: "Consider increasing your savings this month",
        date: new Date().toISOString(),
      });
    }

    setNotifications(newNotifications);
  }, [transactions]);

  const getNotificationColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "bg-green-50 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "warning":
        return "bg-yellow-50 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
      case "info":
        return "bg-blue-50 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Notifications</h1>

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
                  <div className="flex-shrink-0">
                    {notification.type === "success" && (
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    )}
                    {notification.type === "warning" && (
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                        />
                      </svg>
                    )}
                    {notification.type === "info" && (
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    )}
                  </div>
                  <div className="ml-3 w-0 flex-1">
                    <p className="text-sm font-medium">
                      {notification.message}
                    </p>
                    <p className="mt-1 text-sm opacity-75">
                      {new Date(notification.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
