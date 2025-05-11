import { useState } from "react";
import { Transaction, TransactionType } from "../types";
import { useTransactions } from "../context/TransactionContext";

interface TransactionFormProps {
  transaction?: Transaction;
  onClose: () => void;
}

export default function TransactionForm({
  transaction,
  onClose,
}: TransactionFormProps) {
  const { addTransaction, editTransaction, categories } = useTransactions();
  const [formData, setFormData] = useState<Omit<Transaction, "id">>(
    transaction || {
      type: "expense",
      amount: 0,
      date: new Date().toISOString().split("T")[0],
      category: "",
      description: "",
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transaction) {
      editTransaction(transaction.id, formData);
    } else {
      addTransaction(formData);
    }
    onClose();
  };

  const filteredCategories = categories.filter(
    (category) => category.type === formData.type
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Type</label>
        <select
          value={formData.type}
          onChange={(e) =>
            setFormData({
              ...formData,
              type: e.target.value as TransactionType,
            })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
        >
          <option value="expense">Expense</option>
          <option value="income">Income</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Amount
        </label>
        <input
          type="number"
          value={formData.amount}
          onChange={(e) =>
            setFormData({ ...formData, amount: parseFloat(e.target.value) })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">Date</label>
        <input
          type="date"
          value={formData.date}
          onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700">
          Category
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData({ ...formData, category: e.target.value })
          }
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        >
          <option value="">Select a category</option>
          {filteredCategories.map((category) => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 ">
          Description
        </label>
        <input
          type="text"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          className="mt-1 block w-full rounded-md bg-slate-50 border-gray-500 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          required
        />
      </div>

      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onClose}
          className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          {transaction ? "Update" : "Add"} Transaction
        </button>
      </div>
    </form>
  );
}
