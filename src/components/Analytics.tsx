import { useState } from "react";
import { useTransactions } from "../context/TransactionContext";
import { getMonthlyTransactions } from "../utils/transactions";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

export default function Analytics() {
  const { transactions } = useTransactions();
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  const monthlyData = getMonthlyTransactions(transactions, selectedMonth);
  const totalIncome = monthlyData.income;
  const totalExpenses = monthlyData.expenses;
  const totalSavings = monthlyData.savings;

  const pieData = [
    { name: "Income", value: totalIncome, color: "#10B981" },
    { name: "Expenses", value: totalExpenses, color: "#EF4444" },
    { name: "Savings", value: totalSavings, color: "#3B82F6" },
  ];

  const months = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      <div className="mb-6">
        <label
          htmlFor="month"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select Month
        </label>
        <select
          id="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="block w-full max-w-xs rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
        >
          {months.map((month) => (
            <option key={month} value={month}>
              {new Date(month).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
              })}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Total Income
          </h3>
          <p className="text-3xl font-bold text-green-600">
            ${totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Total Expenses
          </h3>
          <p className="text-3xl font-bold text-red-600">
            ${totalExpenses.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Total Savings
          </h3>
          <p className="text-3xl font-bold text-blue-600">
            ${totalSavings.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Monthly Distribution
        </h3>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, percent }) =>
                  `${name}: ${(percent * 100).toFixed(0)}%`
                }
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value.toFixed(2)}`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
