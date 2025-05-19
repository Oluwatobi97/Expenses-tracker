import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <NavLink to="/" className="font-bold text-lg">
            Expense Tracker
          </NavLink>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden p-2 rounded-md hover:bg-indigo-700 focus:outline-none"
          >
            <svg
              className="h-6 w-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-4">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `hover:underline ${isActive ? "font-bold" : ""}`
              }
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                `hover:underline ${isActive ? "font-bold" : ""}`
              }
            >
              Transactions
            </NavLink>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `hover:underline ${isActive ? "font-bold" : ""}`
              }
            >
              Analytics
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `hover:underline ${isActive ? "font-bold" : ""}`
              }
            >
              Settings
            </NavLink>
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-red-500 hover:bg-red-600 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </nav>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <nav className="md:hidden mt-4 space-y-2">
            <NavLink
              to="/"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md hover:bg-indigo-700 ${
                  isActive ? "bg-indigo-700 font-bold" : ""
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/transactions"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md hover:bg-indigo-700 ${
                  isActive ? "bg-indigo-700 font-bold" : ""
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Transactions
            </NavLink>
            <NavLink
              to="/analytics"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md hover:bg-indigo-700 ${
                  isActive ? "bg-indigo-700 font-bold" : ""
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Analytics
            </NavLink>
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `block px-4 py-2 rounded-md hover:bg-indigo-700 ${
                  isActive ? "bg-indigo-700 font-bold" : ""
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              Settings
            </NavLink>
            <button
              onClick={() => {
                handleLogout();
                setIsMenuOpen(false);
              }}
              className="w-full text-left px-4 py-2 text-red-400 hover:bg-indigo-700 rounded-md"
            >
              Logout
            </button>
          </nav>
        )}
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
