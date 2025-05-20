import { useTheme } from "../context/ThemeContext";

export default function Settings() {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Settings</h1>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
          <div className="space-y-6">
            {/* Theme Settings */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Appearance
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    Theme
                  </h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Choose between light and dark mode
                  </p>
                </div>
                <button
                  onClick={toggleTheme}
                  className="relative inline-flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                >
                  {theme === "dark" ? (
                    <svg
                      className="h-7 w-7 text-yellow-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="h-7 w-7 text-gray-700"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Currency Settings */}
            <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Currency
              </h2>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  Default Currency
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Currently set to USD
                </p>
              </div>
            </div>

            {/* Data Management */}
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Data Management
              </h2>
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Clear All Data
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                  This will permanently delete all your transactions and
                  settings.
                </p>
                <button
                  onClick={() => {
                    if (
                      window.confirm(
                        "Are you sure you want to clear all data? This action cannot be undone."
                      )
                    ) {
                      localStorage.clear();
                      window.location.reload();
                    }
                  }}
                  className="inline-flex items-center px-4 py-2 border border-red-300 dark:border-red-700 text-sm font-medium rounded-md text-red-700 dark:text-red-400 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Clear All Data
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
