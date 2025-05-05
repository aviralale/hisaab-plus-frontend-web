// src/routes/ProtectedNoBusinessRoute.tsx
import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/loader";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedNoBusinessRoute = ({ children }: ProtectedRouteProps) => {
  const { isAuthenticated, loading, user } = useAuth();
  const location = useLocation();

  // Add debug logging to help troubleshoot
  console.log("ProtectedNoBusinessRoute check:", {
    isAuthenticated,
    user,
    loading,
  });

  if (loading) return <Loader />;

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user?.business) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default ProtectedNoBusinessRoute;
