import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import { useAuth } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import useOnlineStatus from "./hooks/useOnlineStatus";

// Pages
import Login from "./pages/Login";
import Register from "./pages/Register";
import EmailVerificationPending from "./pages/EmailVerificationPending";
import DiscoveryMap from "./pages/DiscoveryMap";
import NgoProfile from "./pages/NgoProfile";
import PledgeScreen from "./pages/PledgeScreen";
import DeliveryView from "./pages/DeliveryView";
import DonorDashboard from "./pages/DonorDashboard";
import NgoDashboard from "./pages/NgoDashboard";
import NgoProfileCompletion from "./pages/NgoProfileCompletion";
import AdminDashboard from "./pages/AdminDashboard";

function HomeRoute() {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === "ADMIN") {
    return <Navigate to="/admin/dashboard" replace />;
  }

  if (user.role === "NGO") {
    return <Navigate to="/ngo/dashboard" replace />;
  }

  return <DiscoveryMap />;
}

function AppRoutes() {
  const online = useOnlineStatus();

  return (
    <>
      {!online && (
        <div className="bg-amber-50 border-b border-amber-200 text-amber-800 text-center text-sm py-2 font-medium">
          You are offline. Some features may be unavailable until your
          connection returns.
        </div>
      )}

      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/verify-email" element={<EmailVerificationPending />} />

        {/* Donor routes */}
        <Route path="/" element={<HomeRoute />} />
        <Route path="/map" element={<Navigate to="/" replace />} />
        <Route
          path="/ngo/:ngoId"
          element={
            <ProtectedRoute role="DONOR">
              <NgoProfile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/pledge/:needId"
          element={
            <ProtectedRoute role="DONOR">
              <PledgeScreen />
            </ProtectedRoute>
          }
        />
        <Route
          path="/delivery/:pledgeId"
          element={
            <ProtectedRoute role="DONOR">
              <DeliveryView />
            </ProtectedRoute>
          }
        />
        <Route
          path="/donor/dashboard"
          element={
            <ProtectedRoute role="DONOR">
              <DonorDashboard />
            </ProtectedRoute>
          }
        />

        {/* NGO routes */}
        <Route
          path="/ngo/dashboard"
          element={
            <ProtectedRoute role="NGO">
              <NgoDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo/complete-profile"
          element={
            <ProtectedRoute role="NGO">
              <NgoProfileCompletion />
            </ProtectedRoute>
          }
        />

        {/* Admin route */}
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute role="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
