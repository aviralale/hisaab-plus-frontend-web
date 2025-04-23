import { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface PublicRouteProps {
  children: ReactNode;
  restricted?: boolean;
}

const PublicRoute = ({ children, restricted = false }: PublicRouteProps) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <div>Loading...</div>;
  }
  if (isAuthenticated && restricted) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default PublicRoute;
