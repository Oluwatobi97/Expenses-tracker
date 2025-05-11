import { useState } from "react";
import { Transaction } from "../types";
import { useTransactions } from "../context/TransactionContext";
import TransactionForm from "./TransactionForm";
import { format } from "date-fns";

export default function TransactionList() {
  const { transactions, deleteTransaction } = useTransactions();
  const [editingTransaction, setEditingTransaction] =
    useState<Transaction | null>(null);

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      deleteTransaction(id);
    }
  };

  return (
    <div className="space-y-4">
      {editingTransaction && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-lg font-medium mb-4">Edit Transaction</h2>
            <TransactionForm
              transaction={editingTransaction}
              onClose={() => setEditingTransaction(null)}
            />
          </div>
        </div>
      )}

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {transactions.map((transaction) => (
            <li key={transaction.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {transaction.description}
                  </p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(transaction.date), "MMM d, yyyy")} -{" "}
                    {transaction.category}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex items-center space-x-4">
                  <span
                    className={`text-sm font-medium ${
                      transaction.type === "income"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}$
                    {Math.abs(transaction.amount).toFixed(2)}
                  </span>
                  <button
                    onClick={() => handleEdit(transaction)}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(transaction.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
