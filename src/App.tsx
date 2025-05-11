import { useState } from "react";
import { TransactionProvider } from "./context/TransactionContext";
import TransactionForm from "./components/TransactionForm";
import TransactionList from "./components/TransactionList";
import MonthlySummary from "./components/MonthlySummary";

function App() {
  const [showForm, setShowForm] = useState(false);

  return (
    <TransactionProvider>
      <div className="min-h-screen bg-gray-100">
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold text-gray-900">
                Expense Tracker
              </h1>
              <button
                onClick={() => setShowForm(true)}
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
              >
                Add Transaction
              </button>
            </div>

            <MonthlySummary />

            <div className="mt-8">
              <TransactionList />
            </div>

            {showForm && (
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <h2 className="text-lg font-medium mb-4">Add Transaction</h2>
                  <TransactionForm onClose={() => setShowForm(false)} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </TransactionProvider>
  );
}

export default App;
