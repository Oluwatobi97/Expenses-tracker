import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext.js";
import { TransactionProvider } from "./context/TransactionContext.js";
import { ThemeProvider } from "./context/ThemeContext.js";
import PrivateRoute from "./components/PrivateRoute.js";
import { Suspense } from "react";
import Navbar from "./components/Navbar.js";
import Layout from "./components/Layout.js";
import Login from "./components/Login.js";
import Register from "./components/Register.js";
import { Dashboard } from "./components/Dashboard";
import Transactions from "./components/Transactions.js";
import Analytics from "./components/Analytics.js";
import Settings from "./components/Settings.js";
import Notifications from "./components/Notifications.js";
import About from "./components/About.js";

// Lazy load components
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

function App() {
  return (
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <TransactionProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
              <Navbar />
              <Suspense fallback={<LoadingSpinner />}>
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />

                  {/* Protected routes */}
                  <Route
                    path="/"
                    element={
                      <PrivateRoute>
                        <Layout />
                      </PrivateRoute>
                    }
                  >
                    <Route index element={<Dashboard />} />
                    <Route
                      path="dashboard"
                      element={<Navigate to="/" replace />}
                    />
                    <Route path="transactions" element={<Transactions />} />
                    <Route path="analytics" element={<Analytics />} />
                    <Route path="settings" element={<Settings />} />
                    <Route path="notifications" element={<Notifications />} />
                    <Route path="about" element={<About />} />
                  </Route>

                  {/* Catch all route - redirect to dashboard */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Suspense>
            </div>
          </TransactionProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
