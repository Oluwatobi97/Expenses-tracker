import { useAuth } from "../context/AuthContext";
import { Navigate } from "react-router-dom";
import { ReactNode } from "react";

interface PrivateRouteProps {
  children: ReactNode;
}

export default function PrivateRoute({ children }: PrivateRouteProps) {
  const { user } = useAuth();
  return user ? <>{children}</> : <Navigate to="/login" replace />;
}
