import { Outlet } from "react-router-dom";

export default function Layout() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <main className="pt-16">
        <Outlet />
      </main>
    </div>
  );
}
