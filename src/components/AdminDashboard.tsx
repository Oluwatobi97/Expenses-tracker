import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Notification } from "../types/index.js";

interface User {
  id: string;
  name: string;
  email: string;
  subscribed: boolean;
  active: boolean;
  createdAt: string;
  transactionCount: number;
}

const AdminDashboard: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Notification state for admin
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifError, setNotifError] = useState<string | null>(null);
  const [replyingId, setReplyingId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");
  const [notifSuccess, setNotifSuccess] = useState<string | null>(null);

  // Fetch users from API
  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);

      const token =
        user?.token || localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user") || "{}").token
          : null;

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch("/api/admin/users", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized - Please login as admin");
        } else if (response.status === 403) {
          throw new Error("Access denied - Admin privileges required");
        } else {
          throw new Error(`Server error: ${response.status}`);
        }
      }

      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
      setError(err instanceof Error ? err.message : "Failed to fetch users");
    } finally {
      setLoading(false);
    }
  };

  // Toggle user block status
  const toggleBlock = async (userId: string, currentActive: boolean) => {
    try {
      const token =
        user?.token || localStorage.getItem("user")
          ? JSON.parse(localStorage.getItem("user") || "{}").token
          : null;

      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ active: !currentActive }),
      });

      if (!response.ok) {
        throw new Error("Failed to update user status");
      }

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, active: !currentActive } : user
        )
      );
    } catch (err) {
      console.error("Error updating user status:", err);
      alert(
        err instanceof Error ? err.message : "Failed to update user status"
      );
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Fetch all notifications
  const fetchNotifications = async () => {
    setNotifLoading(true);
    setNotifError(null);
    try {
      const res = await fetch("/api/notifications");
      if (!res.ok) throw new Error("Failed to fetch notifications");
      setNotifications(await res.json());
    } catch (err) {
      setNotifError("Failed to load notifications");
    } finally {
      setNotifLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchNotifications();
  }, []);

  // Handle reply submit
  const handleReply = async (notifId: number) => {
    setNotifLoading(true);
    setNotifError(null);
    setNotifSuccess(null);
    try {
      const res = await fetch(`/api/notifications/${notifId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reply: replyText }),
      });
      if (!res.ok) throw new Error("Failed to send reply");
      setReplyText("");
      setReplyingId(null);
      setNotifSuccess("Reply sent.");
      fetchNotifications();
    } catch (err) {
      setNotifError("Failed to send reply");
    } finally {
      setNotifLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Admin Dashboard
            </h1>
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 max-w-md mx-auto">
              <p className="text-red-700 dark:text-red-400 mb-4">{error}</p>
              <button
                onClick={fetchUsers}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <button
            onClick={fetchUsers}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            Total Users:{" "}
            <span className="font-semibold text-gray-900 dark:text-white">
              {users.length}
            </span>
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full bg-white dark:bg-gray-800 rounded-lg shadow">
            <thead>
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Transactions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Subscription
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3"></th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr
                  key={user.id}
                  className={
                    user.subscribed ? "bg-indigo-50 dark:bg-indigo-900/20" : ""
                  }
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {user.name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {user.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                    {user.transactionCount}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.subscribed ? (
                      <span className="px-2 py-1 bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-full text-xs font-semibold">
                        Subscribed
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs font-semibold">
                        Free
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {user.active ? (
                      <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 rounded-full text-xs font-semibold">
                        Active
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-full text-xs font-semibold">
                        Blocked
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => toggleBlock(user.id, user.active)}
                      className={`px-4 py-2 rounded text-xs font-semibold transition-colors focus:outline-none ${
                        user.active
                          ? "bg-red-600 text-white hover:bg-red-700"
                          : "bg-green-600 text-white hover:bg-green-700"
                      }`}
                    >
                      {user.active ? "Block" : "Unblock"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {users.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">No users found</p>
          </div>
        )}

        {/* Notifications Section */}
        <div className="mt-12">
          <h2 className="text-2xl font-bold mb-4 text-indigo-700 dark:text-indigo-300">
            User Notifications
          </h2>
          {notifLoading ? (
            <div>Loading notifications...</div>
          ) : notifError ? (
            <div className="text-red-500">{notifError}</div>
          ) : notifications.length === 0 ? (
            <div className="text-gray-500">No notifications yet.</div>
          ) : (
            <ul className="space-y-4">
              {notifications.map((notif) => (
                <li
                  key={notif.id}
                  className="border rounded p-4 bg-white dark:bg-gray-800"
                >
                  <div className="mb-2 text-gray-800 dark:text-gray-200">
                    <span className="font-semibold">User ID:</span>{" "}
                    {notif.user_id}
                  </div>
                  <div className="mb-2">
                    <span className="font-semibold">Message:</span>{" "}
                    {notif.message}
                  </div>
                  {notif.reply ? (
                    <div className="mt-2 text-green-700 dark:text-green-400">
                      <span className="font-semibold">Admin reply:</span>{" "}
                      {notif.reply}
                    </div>
                  ) : (
                    <div className="mt-2">
                      {replyingId === notif.id ? (
                        <div className="flex flex-col gap-2">
                          <textarea
                            className="w-full p-2 border border-gray-300 rounded dark:bg-gray-700 dark:text-white"
                            rows={2}
                            placeholder="Type your reply..."
                            value={replyText}
                            onChange={(e) => setReplyText(e.target.value)}
                          />
                          <div className="flex gap-2">
                            <button
                              className="bg-indigo-600 text-white px-4 py-1 rounded hover:bg-indigo-700"
                              onClick={() => handleReply(notif.id)}
                              disabled={notifLoading || !replyText.trim()}
                            >
                              {notifLoading ? "Sending..." : "Send Reply"}
                            </button>
                            <button
                              className="bg-gray-300 text-gray-800 px-4 py-1 rounded hover:bg-gray-400"
                              onClick={() => {
                                setReplyingId(null);
                                setReplyText("");
                              }}
                              disabled={notifLoading}
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          className="bg-indigo-500 text-white px-4 py-1 rounded hover:bg-indigo-600"
                          onClick={() => {
                            setReplyingId(notif.id);
                            setReplyText("");
                          }}
                        >
                          Reply
                        </button>
                      )}
                    </div>
                  )}
                  <div className="text-xs text-gray-400 mt-2">
                    Sent: {new Date(notif.created_at).toLocaleString()}
                    {notif.replied_at && (
                      <span>
                        {" "}
                        | Replied: {new Date(notif.replied_at).toLocaleString()}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          )}
          {notifSuccess && (
            <div className="text-green-600 mt-2">{notifSuccess}</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
