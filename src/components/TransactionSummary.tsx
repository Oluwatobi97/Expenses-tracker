import { useTransactions } from "../context/TransactionContext.js";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
} from "recharts";

export default function TransactionSummary() {
  const { transactions, currency } = useTransactions();

  // Calculate totals
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalSavings = transactions
    .filter((t) => t.type === "savings")
    .reduce((sum, t) => sum + t.amount, 0);
  const balance = totalIncome - totalExpenses;
  const savingsRate = totalIncome ? (totalSavings / totalIncome) * 100 : 0;

  const data = [
    { name: "Income", value: totalIncome, color: "#10B981" },
    { name: "Expenses", value: totalExpenses, color: "#EF4444" },
    { name: "Savings", value: totalSavings, color: "#3B82F6" },
  ];

  // Local currency formatter
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat("en-NG", {
      style: "currency",
      currency: currency,
    }).format(amount);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Monthly Summary</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Income</span>
            <span className="text-green-600 font-semibold">
              {formatCurrency(totalIncome)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Expenses</span>
            <span className="text-red-600 font-semibold">
              {formatCurrency(totalExpenses)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Total Savings</span>
            <span className="text-blue-600 font-semibold">
              {formatCurrency(totalSavings)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Balance</span>
            <span
              className={`font-semibold ${
                balance >= 0 ? "text-green-600" : "text-red-600"
              }`}
            >
              {formatCurrency(balance)}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Savings Rate</span>
            <span className="text-blue-600 font-semibold">
              {savingsRate.toFixed(1)}%
            </span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Monthly Transactions
        </h3>
        <div className="space-y-2">
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex justify-between items-center p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <p className="font-medium text-gray-900">
                  {transaction.description}
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
  );
}
