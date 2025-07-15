import { useState } from "react";
import { useTransactions } from "../context/TransactionContext.js";
import { useAuth } from "../context/AuthContext.js";
import { Transaction } from "../types/index.js";

interface TransactionFormProps {
  onClose: () => void;
  transaction?: Transaction;
}

type TransactionFormData = Omit<
  Transaction,
  "id" | "created_at" | "updated_at" | "user_id"
>;

export default function TransactionForm({
  onClose,
  transaction,
}: TransactionFormProps) {
  const { addTransaction, updateTransaction } = useTransactions();
  const { user } = useAuth();
  const [formData, setFormData] = useState<TransactionFormData>(
    transaction || {
      type: "income",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      description: "",
    }
  );

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pendingSubmit, setPendingSubmit] = useState<null | (() => void)>(null);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (formData.amount <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    }
    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }
    if (!user?.id) {
      newErrors.general = "You must be logged in to add transactions";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;
    setShowConfirm(true);
    setPendingSubmit(() => async () => {
      setIsSubmitting(true);
      try {
        if (transaction) {
          await updateTransaction(transaction.id, formData);
        } else {
          await addTransaction({
            ...formData,
            user_id: user!.id,
          });
        }
        onClose();
      } catch (error) {
        setErrors({
          general:
            error instanceof Error
              ? error.message
              : "Failed to save transaction",
        });
      } finally {
        setIsSubmitting(false);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="relative w-full max-w-lg mx-auto bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none"
          aria-label="Close"
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
          {transaction ? "Edit Transaction" : "Add New Transaction"}
        </h2>
        {errors.general && (
          <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md text-center">
            {errors.general}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Type
              </label>
              <select
                value={formData.type}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    type: e.target.value as "income" | "expense" | "savings",
                  })
                }
                className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="income">Income</option>
                <option value="expense">Expense</option>
                <option value="savings">Savings</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Amount
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                required
                value={formData.amount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    amount: parseFloat(e.target.value) || 0,
                  })
                }
                className={`block w-full rounded-lg border ${
                  errors.amount
                    ? "border-red-400"
                    : "border-gray-300 dark:border-gray-600"
                } bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
              />
              {errors.amount && (
                <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                  {errors.amount}
                </p>
              )}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Description
            </label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className={`block w-full rounded-lg border ${
                errors.description
                  ? "border-red-400"
                  : "border-gray-300 dark:border-gray-600"
              } bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500`}
            />
            {errors.description && (
              <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                {errors.description}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Date
            </label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) =>
                setFormData({ ...formData, date: e.target.value })
              }
              className="block w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-5 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex justify-center rounded-lg border border-transparent bg-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Saving..."
                : transaction
                ? "Save Changes"
                : "Add Transaction"}
            </button>
          </div>
        </form>
        {/* Confirmation Modal */}
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
            <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 max-w-xs w-full shadow-xl border border-gray-200 dark:border-gray-700">
              <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white text-center">
                Confirm Transaction
              </h2>
              <p className="mb-4 text-center">
                Are you sure you want to {transaction ? "edit" : "add"} this
                transaction for{" "}
                <span className="font-bold">{formData.amount}</span>?
              </p>
              <div className="flex justify-end space-x-3">
                <button
                  className="px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"
                  onClick={() => {
                    setShowConfirm(false);
                    setPendingSubmit(null);
                  }}
                >
                  No
                </button>
                <button
                  className="px-4 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700"
                  onClick={async () => {
                    setShowConfirm(false);
                    if (pendingSubmit) await pendingSubmit();
                  }}
                >
                  Yes
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
