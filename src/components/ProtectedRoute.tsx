import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole = "user",
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="mt-40 flex justify-center">
          <div className="text-white text-xl">Loading...</div>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === "admin" && user.role !== "admin") {
    return <Navigate to="/home" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
