import { useState } from "react";
import { Transaction } from "../types/index.js";
import { useTransactions } from "../context/TransactionContext.js";
import TransactionForm from "./TransactionForm.js";
import { format } from "date-fns";
import { differenceInHours } from "date-fns";

export default function TransactionList() {
  const { transactions, loading, error, currency } = useTransactions();
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  // Local currency formatter
  const formatCurrency = (amount: number) => {
    if (isNaN(amount)) return "$0.00";
    return new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative"
        role="alert"
      >
        <strong className="font-bold">Error!</strong>
        <span className="block sm:inline"> {error}</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {editingTransaction && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">
              Edit Transaction
            </h2>
            <TransactionForm
              transaction={editingTransaction}
              onClose={() => setEditingTransaction(null)}
            />
          </div>
        </div>
      )}

      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {transactions.map((transaction) => {
            const createdAt = transaction.created_at || transaction.date;
            const hoursSinceCreation = differenceInHours(
              new Date(),
              new Date(createdAt)
            );
            const canEdit = hoursSinceCreation <= 3;
            console.log("DEBUG TRANSACTION:", {
              transaction,
              createdAt,
              hoursSinceCreation,
              canEdit,
            });
            return (
              <li key={transaction.id} className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                      {transaction.description}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(transaction.date), "MMM d, yyyy")}
                    </p>
                  </div>
                  <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                    <span
                      className={`text-sm font-medium ${
                        transaction.type === "income"
                          ? "text-green-600 dark:text-green-400"
                          : transaction.type === "savings"
                          ? "text-blue-600 dark:text-blue-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {transaction.type === "expense" ? "-" : "+"}
                      {formatCurrency(Math.abs(transaction.amount))}
                    </span>
                    <button
                      onClick={() => (canEdit ? handleEdit(transaction) : null)}
                      className={`text-indigo-600 hover:text-indigo-900 dark:text-indigo-400 dark:hover:text-indigo-300 ${
                        !canEdit ? "opacity-50 cursor-not-allowed" : ""
                      }`}
                      disabled={!canEdit}
                      title={
                        canEdit
                          ? "Edit transaction"
                          : "You can only edit within 3 hours of creation"
                      }
                    >
                      Edit
                    </button>
                    {/* Delete button removed unless you implement deleteTransaction */}
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
