import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./auth/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

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

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<EmailVerificationPending />} />

          {/* Donor routes */}
          <Route
            path="/map"
            element={
              <ProtectedRoute role="DONOR">
                <DiscoveryMap />
              </ProtectedRoute>
            }
          />
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

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
