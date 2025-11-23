import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthProvider.jsx";
import { doc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "./lib/firebase";

import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Home from "./pages/Home.jsx";
import Caregivers from "./pages/Caregivers.jsx";
import CaregiverDetail from "./pages/CaregiverDetail.jsx";
import MyProfile from "./pages/MyProfile.jsx";
import SignIn from "./pages/SignIn.jsx";
import BookingForm from "./pages/BookingForm.jsx";
import BookingDetail from "./pages/BookingDetail.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import SerCuidador from "./pages/SerCuidador.jsx";
import CaregiverRequests from "./pages/CaregiverRequests.jsx";

function ProtectedRoute({ children }) {
  const { user, status } = useAuth();
  if (status === "loading") return <div className="p-6">Cargando…</div>;
  if (!user) return <Navigate to="/signin" replace />;
  return children;
}

export default function App() {
  const { user } = useAuth();

  const [caregiverInfo, setCaregiverInfo] = useState({
    loading: true,
    isCaregiver: false,
    pendingCount: 0,
  });

  useEffect(() => {
    if (!user) {
      setCaregiverInfo({ loading: false, isCaregiver: false, pendingCount: 0 });
      return;
    }

    let unsubscribeCaregiver = null;
    let unsubscribePending = null;

    // Verificar si el usuario es cuidador
    unsubscribeCaregiver = onSnapshot(
      doc(db, "caregivers", user.uid),
      (snapshot) => {
        const isCaregiver = snapshot.exists();
        
        if (!isCaregiver) {
          setCaregiverInfo({
            loading: false,
            isCaregiver: false,
            pendingCount: 0,
          });
          if (unsubscribePending) unsubscribePending();
          return;
        }

        // Si es cuidador, escuchar solicitudes pendientes
        if (unsubscribePending) unsubscribePending();
        
        const pendingQuery = query(
          collection(db, "bookings"),
          where("caregiverId", "==", user.uid),
          where("status", "==", "REQUESTED")
        );
        
        unsubscribePending = onSnapshot(pendingQuery, (pendingSnapshot) => {
          setCaregiverInfo({
            loading: false,
            isCaregiver: true,
            pendingCount: pendingSnapshot.size,
          });
        });
      },
      (error) => {
        console.error("Error verificando cuidador:", error);
        setCaregiverInfo({ loading: false, isCaregiver: false, pendingCount: 0 });
      }
    );

    return () => {
      if (unsubscribeCaregiver) unsubscribeCaregiver();
      if (unsubscribePending) unsubscribePending();
    };
  }, [user]);

  const { isCaregiver, pendingCount } = caregiverInfo;

  return (
    <div className="min-h-screen bg-white text-gray-900 flex flex-col">
      <Header isCaregiver={isCaregiver} pendingCount={pendingCount} />

      
      <main className="w-full flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/caregivers" element={<Caregivers />} />
          <Route path="/caregivers/:id" element={<CaregiverDetail />} />

          <Route path="/reservar/:id" element={<BookingForm />} />
          <Route path="/reserva/:id" element={<BookingDetail />} />
          <Route
            path="/reservas"
            element={
              <ProtectedRoute>
                <MyBookings />
              </ProtectedRoute>
            }
          />

          <Route
            path="/ser-cuidador"
            element={
              <ProtectedRoute>
                <SerCuidador />
              </ProtectedRoute>
            }
          />

          <Route
            path="/solicitudes"
            element={
              <ProtectedRoute>
                <CaregiverRequests />
              </ProtectedRoute>
            }
          />

          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <MyProfile />
              </ProtectedRoute>
            }
          />

          <Route path="/signin" element={<SignIn />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

    
      <Footer />
    </div>
  );
}
