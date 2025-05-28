import { useTheme } from "../context/ThemeContext.js";
import { useState } from "react";

interface Currency {
  code: string;
  symbol: string;
  name: string;
}

const currencies: Currency[] = [
  { code: "USD", symbol: "$", name: "US Dollar" },
  { code: "EUR", symbol: "€", name: "Euro" },
  { code: "GBP", symbol: "£", name: "British Pound" },
  { code: "JPY", symbol: "¥", name: "Japanese Yen" },
  { code: "INR", symbol: "₹", name: "Indian Rupee" },
  { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
  { code: "CNY", symbol: "¥", name: "Chinese Yuan" },
  { code: "NGN", symbol: "₦", name: "Nigerian Naira" },
];

type CurrencyCode = (typeof currencies)[number]["code"];

export default function Settings() {
  const { theme, toggleTheme } = useTheme();
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>(() => {
    return (localStorage.getItem("currency") as CurrencyCode) || "USD";
  });

  const handleCurrencyChange = (currencyCode: CurrencyCode) => {
    setSelectedCurrency(currencyCode);
    localStorage.setItem("currency", currencyCode);
  };

  const handleClearData = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all data? This action cannot be undone."
      )
    ) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">Settings</h1>

      <div className="space-y-6">
        {/* Theme Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Theme Settings
          </h2>
          <div className="flex items-center justify-between">
            <span className="text-gray-700 dark:text-gray-300">Dark Mode</span>
            <button
              onClick={toggleTheme}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 ${
                theme === "dark" ? "bg-indigo-600" : "bg-gray-200"
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  theme === "dark" ? "translate-x-6" : "translate-x-1"
                }`}
              />
            </button>
          </div>
        </div>

        {/* Currency Settings */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Currency Settings
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {currencies.map((currency) => (
              <button
                key={currency.code}
                onClick={() =>
                  handleCurrencyChange(currency.code as CurrencyCode)
                }
                className={`p-4 rounded-lg border-2 transition-all ${
                  selectedCurrency === currency.code
                    ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20"
                    : "border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-700"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {currency.code}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {currency.name}
                    </div>
                  </div>
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {currency.symbol}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Data Management */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Data Management
          </h2>
          <button
            onClick={handleClearData}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
          >
            Clear All Data
          </button>
        </div>
      </div>
    </div>
  );
}
