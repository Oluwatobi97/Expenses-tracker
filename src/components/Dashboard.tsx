import { useTransactions } from "../context/TransactionContext.js";
import { Transaction } from "../types/index.js";
import MonthlySummary from "./MonthlySummary.js";
import TransactionForm from "./TransactionForm.js";
import { useState } from "react";

export default function Dashboard() {
  const { transactions } = useTransactions();
  const [isFormOpen, setIsFormOpen] = useState<boolean>(false);

  const totalIncome: number = transactions
    .filter((t: Transaction) => t.type === "income")
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const totalExpenses: number = transactions
    .filter((t: Transaction) => t.type === "expense")
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const totalSavings: number = transactions
    .filter((t: Transaction) => t.type === "savings")
    .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

  const balance: number = totalIncome - totalExpenses;

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold dark:text-white">Dashboard</h1>
        <button
          onClick={() => setIsFormOpen(true)}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        >
          Add Transaction
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
            Balance
          </h3>
          <p
            className={`text-3xl font-bold ${
              balance >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(balance)}
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

      {/* Monthly Summary */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
          Monthly Summary
        </h2>
        <MonthlySummary transactions={transactions} />
      </div>

      {/* Transaction Form Modal */}
      {isFormOpen && <TransactionForm onClose={() => setIsFormOpen(false)} />}
    </div>
  );
}
