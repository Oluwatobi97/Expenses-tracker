import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Layout() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-indigo-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <NavLink to="/" className="font-bold text-lg">
            Expense Tracker
          </NavLink>
          <nav className="flex items-center space-x-4">
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
      </header>
      <main className="container mx-auto px-4 py-8">
        <Outlet />
      </main>
    </div>
  );
}
