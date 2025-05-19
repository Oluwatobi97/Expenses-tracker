import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import { Suspense, lazy } from "react";

// Lazy load components
const Login = lazy(() => import("./components/Login"));
const Register = lazy(() => import("./components/Register"));
const Dashboard = lazy(() => import("./components/Dashboard"));
const Transactions = lazy(() => import("./components/Transactions"));
const Analytics = lazy(() => import("./components/Analytics"));
const Settings = lazy(() => import("./components/Settings"));
const Layout = lazy(() => import("./components/Layout"));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
  </div>
);

function App() {
  return (
    <Router>
      <AuthProvider>
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
              <Route path="dashboard" element={<Navigate to="/" replace />} />
              <Route path="transactions" element={<Transactions />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="settings" element={<Settings />} />
            </Route>

            {/* Catch all route - redirect to dashboard */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AuthProvider>
    </Router>
  );
}

export default App;
