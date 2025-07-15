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
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
        {/* Background overlay with blur */}
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        ></div>

        {/* Modal panel */}
        <div className="relative transform overflow-hidden rounded-lg bg-white dark:bg-gray-800 px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white dark:bg-gray-800 text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
            >
              <span className="sr-only">Close</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 className="text-2xl font-semibold leading-6 text-gray-900 dark:text-white mb-6">
                {transaction ? "Edit Transaction" : "Add New Transaction"}
              </h3>
              {errors.general && (
                <div className="mb-4 p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200 rounded-md">
                  {errors.general}
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Type
                    </label>
                    <select
                      value={formData.type}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          type: e.target.value as
                            | "income"
                            | "expense"
                            | "savings",
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                      <option value="income">Income</option>
                      <option value="expense">Expense</option>
                      <option value="savings">Savings</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                      Amount
                    </label>
                    <div className="relative mt-1 rounded-md shadow-sm">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                          $
                        </span>
                      </div>
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
                        className={`block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white pl-7 pr-12 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                          errors.amount ? "border-red-300" : ""
                        }`}
                      />
                    </div>
                    {errors.amount && (
                      <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                        {errors.amount}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Description
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    className={`mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm ${
                      errors.description ? "border-red-300" : ""
                    }`}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                      {errors.description}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    Date
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.date}
                    onChange={(e) =>
                      setFormData({ ...formData, date: e.target.value })
                    }
                    className="mt-1 block w-full rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:text-white shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                  />
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="inline-flex justify-center rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? "Saving..."
                      : transaction
                      ? "Save Changes"
                      : "Add Transaction"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full">
            <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
              Confirm Transaction
            </h2>
            <p className="mb-4">
              Are you sure you want to {transaction ? "edit" : "add"} this
              transaction for{" "}
              <span className="font-bold">{formData.amount}</span>?
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
                onClick={() => {
                  setShowConfirm(false);
                  setPendingSubmit(null);
                }}
              >
                No
              </button>
              <button
                className="px-4 py-2 rounded-md bg-indigo-600 text-white hover:bg-indigo-700"
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
  );
}
