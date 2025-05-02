import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/loader";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedBusinessRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, hasBusiness, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  } else if (isAuthenticated && !hasBusiness) {
    return (
      <Navigate to="/create-business" state={{ from: location }} replace />
    );
  }
  if (hasBusiness) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedBusinessRoute;
