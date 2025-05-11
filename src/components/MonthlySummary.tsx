import { useTransactions } from "../context/TransactionContext";
import { format } from "date-fns";

export default function MonthlySummary() {
  const { getMonthlySummary } = useTransactions();
  const { totalIncome, totalExpenses, balance } = getMonthlySummary();

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Summary for {format(new Date(), "MMMM yyyy")}
      </h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="bg-green-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-green-800">Total Income</h3>
          <p className="mt-1 text-2xl font-semibold text-green-600">
            ${totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="bg-red-50 p-4 rounded-lg">
          <h3 className="text-sm font-medium text-red-800">Total Expenses</h3>
          <p className="mt-1 text-2xl font-semibold text-red-600">
            ${totalExpenses.toFixed(2)}
          </p>
        </div>
        <div
          className={`p-4 rounded-lg ${
            balance >= 0 ? "bg-green-50" : "bg-red-50"
          }`}
        >
          <h3 className="text-sm font-medium text-gray-800">Balance</h3>
          <p
            className={`mt-1 text-2xl font-semibold ${
              balance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ${balance.toFixed(2)}
          </p>
        </div>
      </div>
    </div>
  );
}
