import { useAuth } from "../context/AuthContext.js";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface AdminRouteProps {
  children: ReactNode;
}

export default function AdminRoute({ children }: AdminRouteProps) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Check if user is logged in
  if (!user) {
    return <Navigate to="/admin-login" replace />;
  }

  // Admin check - only this specific email has admin access
  const adminEmails = ["victortobi2000@gmail.com"];

  const isAdmin = adminEmails.includes(user.email);

  if (!isAdmin) {
    // Redirect to dashboard - unauthorized users won't know the admin page exists
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
