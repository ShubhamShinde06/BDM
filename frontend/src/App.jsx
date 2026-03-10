import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Toaster } from "react-hot-toast";
import { selectIsAuthenticated, selectCurrentRole } from "./features/auth/authSlice";

// Layout
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";

// Auth pages
import LoginPage    from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";

// Admin pages
import AdminOverview   from "./pages/admin/AdminOverview";
import AdminHospitals  from "./pages/admin/AdminHospitals";
import AdminUsers      from "./pages/admin/AdminUsers";
import AdminRequests   from "./pages/admin/AdminRequests";
import AdminInventory  from "./pages/admin/AdminInventory";
import AdminReports    from "./pages/admin/AdminReports";

// Hospital pages
import HospitalDashboard from "./pages/hospital/HospitalDashboard";
import HospitalInventory from "./pages/hospital/HospitalInventory";
import HospitalRequests  from "./pages/hospital/HospitalRequests";
import HospitalDonors    from "./pages/hospital/HospitalDonors";
import HospitalProfile   from "./pages/hospital/HospitalProfile";

// Donor pages
import DonorDashboard  from "./pages/donor/DonorDashboard";
import NearbyRequests  from "./pages/donor/NearbyRequests";
import DonationHistory from "./pages/donor/DonationHistory";

// Receiver pages
import ReceiverDashboard from "./pages/receiver/ReceiverDashboard";
import BloodSearch       from "./pages/receiver/BloodSearch";
import MyRequests        from "./pages/receiver/MyRequests";

// Shared pages
import ProfilePage       from "./pages/shared/ProfilePage";
import NotificationsPage from "./pages/shared/NotificationsPage";

// Role-based home redirect
const ROLE_HOME = {
  main_admin:    "/admin",
  hospital_admin:"/hospital",
  donor:         "/donor",
  receiver:      "/receiver",
};

function RootRedirect() {
  const isAuth = useSelector(selectIsAuthenticated);
  const role   = useSelector(selectCurrentRole);
  if (isAuth && role) return <Navigate to={ROLE_HOME[role] || "/login"} replace />;
  return <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: { background:"#18181C", color:"#F5F5F7", border:"1px solid #2A2A30", fontFamily:"'DM Sans',sans-serif" },
          success: { iconTheme: { primary:"#22C55E", secondary:"#18181C" } },
          error:   { iconTheme: { primary:"#E8192C", secondary:"#18181C" } },
        }}
      />

      <Routes>
        {/* Public */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="/login"    element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />

        {/* ── Main Admin ── */}
        <Route path="/admin" element={
          <ProtectedRoute allowedRoles={["main_admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index            element={<AdminOverview />} />
          <Route path="hospitals" element={<AdminHospitals />} />
          <Route path="users"     element={<AdminUsers />} />
          <Route path="requests"  element={<AdminRequests />} />
          <Route path="inventory" element={<AdminInventory />} />
          <Route path="reports"   element={<AdminReports />} />
        </Route>

        {/* ── Hospital Admin ── */}
        <Route path="/hospital" element={
          <ProtectedRoute allowedRoles={["hospital_admin"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index            element={<HospitalDashboard />} />
          <Route path="inventory" element={<HospitalInventory />} />
          <Route path="requests"  element={<HospitalRequests />} />
          <Route path="donors"    element={<HospitalDonors />} />
          <Route path="profile"   element={<HospitalProfile />} />
        </Route>

        {/* ── Donor ── */}
        <Route path="/donor" element={
          <ProtectedRoute allowedRoles={["donor"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index              element={<DonorDashboard />} />
          <Route path="nearby"      element={<NearbyRequests />} />
          <Route path="history"     element={<DonationHistory />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile"     element={<ProfilePage />} />
        </Route>

        {/* ── Receiver ── */}
        <Route path="/receiver" element={
          <ProtectedRoute allowedRoles={["receiver"]}>
            <DashboardLayout />
          </ProtectedRoute>
        }>
          <Route index              element={<ReceiverDashboard />} />
          <Route path="search"      element={<BloodSearch />} />
          <Route path="requests"    element={<MyRequests />} />
          <Route path="notifications" element={<NotificationsPage />} />
          <Route path="profile"     element={<ProfilePage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
