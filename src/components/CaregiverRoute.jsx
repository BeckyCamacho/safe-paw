
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";

export default function CaregiverRoute({ children }) {
  const { authLoading, user, profile } = useAuth();


  if (authLoading) return null;

  
  if (!user || !profile?.isCaregiver) {
    return <Navigate to="/" replace />;
  }

  
  return children;
}
