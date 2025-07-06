import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { UserLimit, CreateUserLimitRequest } from "../types/index.js";
import { useTransactions } from "../context/TransactionContext";

export default function Settings() {
  const { user } = useAuth();
  const { refreshTransactions } = useTransactions();
  const [userLimit, setUserLimit] = useState<UserLimit | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    daily_limit: "",
    monthly_limit: "",
    daily_limit_enabled: false,
    monthly_limit_enabled: false,
  });
  const [clearSuccess, setClearSuccess] = useState<string | null>(null);
  const [clearError, setClearError] = useState<string | null>(null);
  const [clearing, setClearing] = useState(false);

  const fetchUserLimits = useCallback(async () => {
    if (!user?.id) {
      setError("User not authenticated");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`/api/user-limits/${user.id}`);
      if (response.ok) {
        const data = await response.json();
        if (data) {
          setUserLimit({
            ...data,
            daily_limit:
              data.daily_limit !== null ? Number(data.daily_limit) : null,
            monthly_limit:
              data.monthly_limit !== null ? Number(data.monthly_limit) : null,
          });
          setFormData({
            daily_limit: data.daily_limit?.toString() || "",
            monthly_limit: data.monthly_limit?.toString() || "",
            daily_limit_enabled: data.daily_limit_enabled || false,
            monthly_limit_enabled: data.monthly_limit_enabled || false,
          });
        } else {
          setUserLimit(null);
        }
      } else {
        setError("Failed to fetch user limits");
      }
    } catch (err) {
      setError("Failed to fetch user limits");
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    if (user?.id) {
      fetchUserLimits();
    }
  }, [fetchUserLimits]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const limitData: CreateUserLimitRequest = {
        daily_limit: formData.daily_limit ? Number(formData.daily_limit) : null,
        monthly_limit: formData.monthly_limit
          ? Number(formData.monthly_limit)
          : null,
        daily_limit_enabled: formData.daily_limit_enabled,
        monthly_limit_enabled: formData.monthly_limit_enabled,
      };

      const response = await fetch(`/api/user-limits/${user?.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(limitData),
      });

      if (response.ok) {
        const updatedLimit = await response.json();
        setUserLimit(updatedLimit);
        setSuccess("Spending limits updated successfully!");
      } else {
        setError("Failed to update spending limits");
      }
    } catch (err) {
      setError("Failed to update spending limits");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete your spending limits?")) {
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch(`/api/user-limits/${user?.id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setUserLimit(null);
        setFormData({
          daily_limit: "",
          monthly_limit: "",
          daily_limit_enabled: false,
          monthly_limit_enabled: false,
        });
        setSuccess("Spending limits deleted successfully!");
      } else {
        setError("Failed to delete spending limits");
      }
    } catch (err) {
      setError("Failed to delete spending limits");
    } finally {
      setLoading(false);
    }
  };

  const handleClearTransactions = async () => {
    if (!user?.id) return;
    if (
      !window.confirm(
        "Are you sure you want to clear ALL your transactions? This cannot be undone."
      )
    )
      return;
    setClearing(true);
    setClearSuccess(null);
    setClearError(null);
    try {
      const res = await fetch(`/api/transactions/user/${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to clear transactions");
      setClearSuccess("All transactions cleared successfully!");
      await refreshTransactions();
    } catch (err) {
      setClearError("Failed to clear transactions. Please try again.");
    } finally {
      setClearing(false);
    }
  };

  if (loading && !userLimit) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Settings
        </h1>

        {/* Spending Limits Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Spending Limit Settings
          </h2>

          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Set daily and monthly spending limits to receive alerts when you
            reach or exceed them. You'll receive notifications in your dashboard
            when limits are triggered.
          </p>

          {error && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md">
              <p className="text-green-600 dark:text-green-400">{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Daily Limit Section */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Daily Spending Limit
                </h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.daily_limit_enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        daily_limit_enabled: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Enable daily limit
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Daily Limit Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.daily_limit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        daily_limit: e.target.value,
                      })
                    }
                    disabled={!formData.daily_limit_enabled}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    placeholder="Enter daily limit"
                  />
                </div>
              </div>
            </div>

            {/* Monthly Limit Section */}
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Monthly Spending Limit
                </h3>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.monthly_limit_enabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthly_limit_enabled: e.target.checked,
                      })
                    }
                    className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700"
                  />
                  <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
                    Enable monthly limit
                  </span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Monthly Limit Amount
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.monthly_limit}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        monthly_limit: e.target.value,
                      })
                    }
                    disabled={!formData.monthly_limit_enabled}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-white disabled:opacity-50"
                    placeholder="Enter monthly limit"
                  />
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={handleDelete}
                disabled={!userLimit || loading}
                className="px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 disabled:opacity-50"
              >
                Delete Limits
              </button>

              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-md transition-colors disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Limits"}
              </button>
            </div>
          </form>

          {/* Current Limits Display */}
          {userLimit && (
            <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
                Current Limits
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Daily Limit
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {userLimit.daily_limit_enabled &&
                    userLimit.daily_limit !== null &&
                    userLimit.daily_limit !== undefined
                      ? `₦${Number(userLimit.daily_limit).toFixed(2)}`
                      : "Not set"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Monthly Limit
                  </p>
                  <p className="text-lg font-medium text-gray-900 dark:text-white">
                    {userLimit.monthly_limit_enabled &&
                    userLimit.monthly_limit !== null &&
                    userLimit.monthly_limit !== undefined
                      ? `₦${Number(userLimit.monthly_limit).toFixed(2)}`
                      : "Not set"}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Other Settings Sections */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mt-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
            Account Settings
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            More account settings will be available here soon.
          </p>
          <button
            onClick={handleClearTransactions}
            disabled={clearing}
            className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors disabled:opacity-50"
          >
            {clearing ? "Clearing..." : "Clear Transactions"}
          </button>
          {clearSuccess && (
            <div className="mt-4 p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-700 dark:text-green-400">
              {clearSuccess}
            </div>
          )}
          {clearError && (
            <div className="mt-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-700 dark:text-red-400">
              {clearError}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
