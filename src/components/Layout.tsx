import { Outlet, Link } from "react-router-dom";

export default function Layout() {
  return (
    <div>
      <header className="bg-indigo-600 text-white p-4 flex justify-between items-center">
        <Link to="/" className="font-bold text-lg">
          Expense Tracker
        </Link>
        <nav>
          <Link to="/transactions" className="mr-4 hover:underline">
            Transactions
          </Link>
          <Link to="/analytics" className="mr-4 hover:underline">
            Analytics
          </Link>
          <Link to="/settings" className="hover:underline">
            Settings
          </Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
}
