import { useState } from "react";
import { useTransactions } from "../context/TransactionContext.js";
import TransactionForm from "./TransactionForm";
import { Transaction } from "../types/index.js";
import { differenceInHours } from "date-fns";

export function Transactions() {
  const { transactions, currency, deleteTransaction } = useTransactions();
  const [filter, setFilter] = useState("all");
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter((transaction) => {
    if (filter === "all") return true;
    return transaction.type === filter;
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-2xl text-black dark:text-white mb-5 font-bold">
        Transactions
      </h1>
      <div className="flex justify-between items-center mb-6">
        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`px-4 py-2 rounded ${
              filter === "all"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter("income")}
            className={`px-4 py-2 rounded ${
              filter === "income"
                ? "bg-green-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Income
          </button>
          <button
            onClick={() => setFilter("expense")}
            className={`px-4 py-2 rounded ${
              filter === "expense"
                ? "bg-red-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Expenses
          </button>
          <button
            onClick={() => setFilter("savings")}
            className={`px-4 py-2 rounded ${
              filter === "savings"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-700"
            }`}
          >
            Savings
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredTransactions.map((transaction) => {
                const createdAt = transaction.created_at || transaction.date;
                const hoursSinceCreation = differenceInHours(
                  new Date(),
                  new Date(createdAt)
                );
                const canEdit = hoursSinceCreation <= 3;
                return (
                  <tr key={transaction.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {new Date(transaction.date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          transaction.type === "income"
                            ? "bg-green-100 text-green-800"
                            : transaction.type === "expense"
                            ? "bg-red-100 text-red-800"
                            : "bg-blue-100 text-blue-800"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => setEditingTransaction(transaction)}
                          className="text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 font-medium mr-2"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() =>
                            deleteTransaction &&
                            deleteTransaction(transaction.id)
                          }
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300 font-medium"
                        >
                          Delete
                        </button>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {editingTransaction && (
        <TransactionForm
          transaction={editingTransaction}
          onClose={() => setEditingTransaction(null)}
        />
      )}
    </div>
  );
}
