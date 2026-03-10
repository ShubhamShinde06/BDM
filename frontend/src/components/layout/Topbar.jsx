import { useNavigate, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { logout, selectCurrentRole } from "../../features/auth/authSlice";
import { useLogoutApiMutation } from "../../features/auth/authApi";
import { disconnectSocket } from "../../socket/socket";
import Button from "../ui/Button";

const TITLES = {
  "/admin":            "Overview",
  "/admin/hospitals":  "Hospitals",
  "/admin/users":      "Users",
  "/admin/requests":   "Blood Requests",
  "/admin/inventory":  "Blood Inventory",
  "/admin/reports":    "Reports",
  "/hospital":         "Dashboard",
  "/hospital/inventory":"Inventory",
  "/hospital/requests":"Requests",
  "/hospital/donors":  "Donors",
  "/hospital/profile": "Profile",
  "/donor":            "Dashboard",
  "/donor/nearby":     "Nearby Requests",
  "/donor/history":    "Donation History",
  "/donor/notifications":"Notifications",
  "/donor/profile":    "Profile",
  "/receiver":         "Dashboard",
  "/receiver/search":  "Find Blood",
  "/receiver/requests":"My Requests",
  "/receiver/notifications":"Notifications",
  "/receiver/profile": "Profile",
};

export default function Topbar() {
  const navigate   = useNavigate();
  const dispatch   = useDispatch();
  const { pathname } = useLocation();
  const role       = useSelector(selectCurrentRole);
  const [logoutApi, { isLoading }] = useLogoutApiMutation();

  const title = TITLES[pathname] || "BloodLink";

  const handleLogout = async () => {
    try { await logoutApi().unwrap(); } catch {}
    disconnectSocket();
    dispatch(logout());
    navigate("/login");
    toast.success("Logged out successfully");
  };

  return (
    <header style={{ height: "66px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 28px", borderBottom: "1px solid #2A2A30", background: "rgba(17,17,20,0.7)", backdropFilter: "blur(10px)", flexShrink: 0, position: "sticky", top: 0, zIndex: 50 }}>
      <div>
        <h2 style={{ fontFamily: "'Syne',sans-serif", fontSize: "17px", fontWeight: 700, color: "#F5F5F7" }}>{title}</h2>
        <p style={{ fontSize: "12px", color: "#8E8E9A", marginTop: "1px" }}>BDM Platform</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <div style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#22C55E" }} />
          <span style={{ fontSize: "12px", color: "#8E8E9A" }}>Live</span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleLogout} loading={isLoading}>
          🚪 Logout
        </Button>
      </div>
    </header>
  );
}
