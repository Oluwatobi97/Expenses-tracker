// import { Transaction } from "../types/index.js";

interface MonthlySummaryProps {
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
}

export const MonthlySummary = ({
  totalIncome,
  totalExpenses,
  totalSavings,
}: MonthlySummaryProps) => {
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        Monthly Summary
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800 dark:text-green-400">
            Income
          </h3>
          <p className="mt-1 text-2xl font-semibold text-green-600 dark:text-green-400">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800 dark:text-red-400">
            Expenses
          </h3>
          <p className="mt-1 text-2xl font-semibold text-red-600 dark:text-red-400">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800 dark:text-blue-400">
            Savings
          </h3>
          <p className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">
            {formatCurrency(totalSavings)}
          </p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Balance
          </h3>
          <p
            className={`mt-1 text-2xl font-semibold ${
              balance >= 0
                ? "text-green-600 dark:text-green-400"
                : "text-red-600 dark:text-red-400"
            }`}
          >
            {formatCurrency(balance)}
          </p>
        </div>
        <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-800 dark:text-gray-200">
            Savings Rate
          </h3>
          <p className="mt-1 text-2xl font-semibold text-blue-600 dark:text-blue-400">
            {savingsRate.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
};
