import { useTransactions } from "../context/TransactionContext";
import TransactionForm from "./TransactionForm";
import MonthlySummary from "./MonthlySummary";
import { useState } from "react";

export default function Transactions() {
  const { getMonthlyTransactions } = useTransactions();
  const monthlyTransactions = getMonthlyTransactions();
  const [showForm, setShowForm] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
        >
          Add Transaction
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlySummary />

          <div className="mt-6 bg-white rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">
              Recent Transactions
            </h2>
            <div className="space-y-4">
              {monthlyTransactions.slice(0, 5).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex justify-between items-center p-4 bg-gray-50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500">
                      {transaction.category}
                    </p>
                  </div>
                  <span
                    className={`font-semibold ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : transaction.type === "savings"
                        ? "text-blue-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "expense" ? "-" : "+"}
                    {formatCurrency(transaction.amount)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          {showForm && (
            <div className="bg-white rounded-lg shadow p-6">
              <TransactionForm onClose={() => setShowForm(false)} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
