import { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import Loader from "@/components/loader";

export type UserRole = "owner" | "staff" | "accountant";

interface ProtectedRolesRouteProps {
  children: ReactNode;
  allowedRoles: UserRole[];
}

const ProtectedRolesRoute = ({
  children,
  allowedRoles,
}: ProtectedRolesRouteProps) => {
  const { isAuthenticated, hasBusiness, loading, user } = useAuth();
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
  } else if (!allowedRoles.includes(user?.role as UserRole)) {
    // Redirect to dashboard if user doesn't have the required role
    return <Navigate to="/dashboard" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

export default ProtectedRolesRoute;
