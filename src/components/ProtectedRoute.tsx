import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react";

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  const { user, isLoading } = useAuth();
//extra for reloading errorisLoading
  if (isLoading) return <div>Loading...</div>;
  if (!user) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;
