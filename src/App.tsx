import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { TransactionProvider } from "./context/TransactionContext";
import Navigation from "./components/Navigation";
import LoginForm from "./components/LoginForm";
import RegisterForm from "./components/RegisterForm";
import Dashboard from "./components/Dashboard";
import TransactionList from "./components/TransactionList";
import { useAuth } from "./context/AuthContext";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  return (
    <AuthProvider>
      <TransactionProvider>
        <Router>
          <div className="min-h-screen bg-gray-100">
            <Navigation />
            <main className="py-10">
              <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/login" element={<LoginForm />} />
                  <Route path="/register" element={<RegisterForm />} />
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/transactions"
                    element={
                      <PrivateRoute>
                        <TransactionList />
                      </PrivateRoute>
                    }
                  />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </div>
            </main>
          </div>
        </Router>
      </TransactionProvider>
    </AuthProvider>
  );
}

export default App;
