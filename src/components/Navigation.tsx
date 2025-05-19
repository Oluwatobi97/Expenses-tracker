import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Navigation() {
  const { logout } = useAuth();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link
                to="/dashboard"
                className="text-xl font-bold text-indigo-600"
              >
                Expense Tracker
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/dashboard"
                className={`${
                  isActive("/dashboard")
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Dashboard
              </Link>
              <Link
                to="/transactions"
                className={`${
                  isActive("/transactions")
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Transactions
              </Link>
              <Link
                to="/analytics"
                className={`${
                  isActive("/analytics")
                    ? "border-indigo-500 text-gray-900"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Analytics
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <button
              onClick={logout}
              className="ml-3 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Logout
            </button>
          </div>
          <div className="-mr-2 flex items-center sm:hidden">
            <button
              type="button"
              onClick={() => setMobileOpen((open) => !open)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
              aria-controls="mobile-menu"
              aria-expanded={mobileOpen}
            >
              <span className="sr-only">Open main menu</span>
              <svg
                className="block h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="sm:hidden" id="mobile-menu">
          <div className="pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className={`${
                isActive("/dashboard")
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setMobileOpen(false)}
            >
              Dashboard
            </Link>
            <Link
              to="/transactions"
              className={`${
                isActive("/transactions")
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setMobileOpen(false)}
            >
              Transactions
            </Link>
            <Link
              to="/analytics"
              className={`${
                isActive("/analytics")
                  ? "bg-indigo-50 border-indigo-500 text-indigo-700"
                  : "border-transparent text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
              } block pl-3 pr-4 py-2 border-l-4 text-base font-medium`}
              onClick={() => setMobileOpen(false)}
            >
              Analytics
            </Link>
            <button
              onClick={() => {
                setMobileOpen(false);
                logout();
              }}
              className="block w-full text-left pl-3 pr-4 py-2 border-l-4 border-transparent text-base font-medium text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700"
            >
              Logout
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
