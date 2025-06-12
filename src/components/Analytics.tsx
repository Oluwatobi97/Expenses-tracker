import React, { useState } from "react";
import { useTransactions } from "../context/TransactionContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { getMonthlyTransactions } from "../utils/transactions";

const COLORS = ["#10B981", "#EF4444", "#3B82F6"];

const Analytics: React.FC = () => {
  const { transactions } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const monthlyData = getMonthlyTransactions(transactions, selectedMonth);
  const totalIncome = monthlyData.income || 0;
  const totalExpenses = monthlyData.expenses || 0;
  const totalSavings = monthlyData.savings || 0;

  const data = [
    { name: "Income", value: totalIncome },
    { name: "Expenses", value: totalExpenses },
    { name: "Savings", value: totalSavings },
  ];

  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return "$0.00";
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Analytics
        </h2>
        <select
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="p-2 border rounded dark:bg-gray-800 dark:border-gray-700"
        >
          {Array.from({ length: 12 }, (_, i) => {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const month = `${date.getFullYear()}-${String(
              date.getMonth() + 1
            ).padStart(2, "0")}`;
            return (
              <option key={month} value={month}>
                {date.toLocaleString("default", {
                  month: "long",
                  year: "numeric",
                })}
              </option>
            );
          })}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Total Income
          </h3>
          <p className="text-3xl font-bold text-green-600 dark:text-green-400">
            {formatCurrency(totalIncome)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Total Expenses
          </h3>
          <p className="text-3xl font-bold text-red-600 dark:text-red-400">
            {formatCurrency(totalExpenses)}
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            Total Savings
          </h3>
          <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {formatCurrency(totalSavings)}
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          Distribution
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name} ${(percent * 100).toFixed(0)}%`
                }
              >
                {data.map((_, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={COLORS[index % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
