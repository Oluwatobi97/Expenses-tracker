// import React, { useState, useEffect } from "react";
import { useState, useEffect } from "react";
import { useTransactions } from "../context/TransactionContext.js";
import {
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
  savings: number;
}

export function Analytics() {
  const { transactions, currency, convertAmount } = useTransactions();
  const [convertedTotals, setConvertedTotals] = useState({
    income: 0,
    expenses: 0,
    savings: 0,
  });
  const [lineData, setLineData] = useState<MonthlyData[]>([]);

  useEffect(() => {
    const calculateMonthlyTotals = async () => {
      const totals = { income: 0, expenses: 0, savings: 0 };

      for (const transaction of transactions) {
        try {
          const amount = await convertAmount(
            Number(transaction.amount) || 0,
            "NGN",
            currency
          );

          if (isNaN(amount)) {
            console.error("Invalid amount:", transaction.amount);
            continue;
          }

          switch (transaction.type) {
            case "income":
              totals.income += amount;
              break;
            case "expense":
              totals.expenses += amount;
              break;
            case "savings":
              totals.savings += amount;
              break;
          }
        } catch (error) {
          console.error("Error processing transaction:", error);
        }
      }

      setConvertedTotals(totals);
    };

    calculateMonthlyTotals();
  }, [transactions, currency, convertAmount]);

  useEffect(() => {
    const calculateLineData = async () => {
      const months: MonthlyData[] = [];

      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const monthName = date.toLocaleString("default", { month: "short" });

        const monthTransactions = transactions.filter((transaction) => {
          const transactionDate = new Date(transaction.date);
          return (
            transactionDate.getMonth() === date.getMonth() &&
            transactionDate.getFullYear() === date.getFullYear()
          );
        });

        const totals = { income: 0, expenses: 0, savings: 0 };

        for (const transaction of monthTransactions) {
          try {
            const amount = await convertAmount(
              Number(transaction.amount) || 0,
              "NGN", // Assuming all transactions are in NGN
              currency
            );

            if (isNaN(amount)) {
              console.error("Invalid amount:", transaction.amount);
              continue;
            }

            switch (transaction.type) {
              case "income":
                totals.income += amount;
                break;
              case "expense":
                totals.expenses += amount;
                break;
              case "savings":
                totals.savings += amount;
                break;
            }
          } catch (error) {
            console.error("Error processing transaction:", error);
          }
        }

        months.push({
          month: monthName,
          income: isNaN(totals.income) ? 0 : totals.income,
          expenses: isNaN(totals.expenses) ? 0 : totals.expenses,
          savings: isNaN(totals.savings) ? 0 : totals.savings,
        });
      }

      setLineData(months);
    };

    calculateLineData();
  }, [transactions, currency, convertAmount]);

  const formatCurrency = (value: number) => {
    if (isNaN(value)) return "0.00";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  // Prepare data for pie chart
  const pieData = [
    { name: "Income", value: convertedTotals.income || 0 },
    { name: "Expenses", value: convertedTotals.expenses || 0 },
    { name: "Savings", value: convertedTotals.savings || 0 },
  ].filter((item) => item.value > 0);

  const COLORS = ["#10B981", "#EF4444", "#3B82F6"];

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-2xl font-bold mb-6">Analytics</h1>

      {/* Monthly Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Monthly Income
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(convertedTotals.income)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Monthly Expenses
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(convertedTotals.expenses)}
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Monthly Savings
          </h3>
          <p className="text-2xl font-bold text-blue-600">
            {formatCurrency(convertedTotals.savings)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Pie Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Monthly Distribution
          </h3>
          {pieData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ name, value }) =>
                      `${name}: ${formatCurrency(value)}`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value) => formatCurrency(value as number)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-center text-gray-500 dark:text-gray-400">
              No data available for this month
            </p>
          )}
        </div>

        {/* Line Chart */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
          <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4">
            Monthly Trends
          </h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip
                  formatter={(value) => formatCurrency(value as number)}
                  labelFormatter={(label) => `${label}`}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  name="Income"
                />
                <Line
                  type="monotone"
                  dataKey="expenses"
                  stroke="#EF4444"
                  name="Expenses"
                />
                <Line
                  type="monotone"
                  dataKey="savings"
                  stroke="#3B82F6"
                  name="Savings"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
