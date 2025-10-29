// src/components/CaregiverRoute.jsx
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthProvider.jsx";

export default function CaregiverRoute({ children }) {
  const { user } = useAuth();
  const isCaregiver = user?.isCaregiver;

  if (!isCaregiver) {
    return <Navigate to="/" replace />;
  }

  return children;
}
