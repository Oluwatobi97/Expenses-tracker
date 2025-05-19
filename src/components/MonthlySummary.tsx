import { useTransactions } from "../context/TransactionContext";

export default function MonthlySummary() {
  const { getMonthlySummary } = useTransactions();
  const { totalIncome, totalExpenses, totalSavings, balance, savingsRate } =
    getMonthlySummary();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        Monthly Summary
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Income</h3>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            {formatCurrency(totalIncome)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">Expenses</h3>
          <p className="mt-1 text-2xl font-semibold text-red-600">
            {formatCurrency(totalExpenses)}
          </p>
        </div>
        <div className="bg-blue-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-blue-800">Savings</h3>
          <p className="mt-1 text-2xl font-semibold text-blue-600">
            {formatCurrency(totalSavings)}
          </p>
        </div>
      </div>
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-800">Balance</h3>
          <p
            className={`mt-1 text-2xl font-semibold ${
              balance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatCurrency(balance)}
          </p>
        </div>
        <div className="bg-gray-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-gray-800">Savings Rate</h3>
          <p className="mt-1 text-2xl font-semibold text-blue-600">
            {savingsRate.toFixed(1)}%
          </p>
        </div>
      </div>
    </div>
  );
}
