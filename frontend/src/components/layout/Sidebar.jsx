import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { selectSidebar, toggleSidebar } from "../../features/ui/uiSlice";
import { selectCurrentUser, selectCurrentRole } from "../../features/auth/authSlice";

const NAV = {
  main_admin: [
    { to: "/admin",           label: "Overview",       icon: "📊", end: true },
    { to: "/admin/hospitals", label: "Hospitals",      icon: "🏥" },
    { to: "/admin/users",     label: "Users",          icon: "👥" },
    { to: "/admin/requests",  label: "Blood Requests", icon: "🩸" },
    { to: "/admin/inventory", label: "Inventory",      icon: "🏦" },
    { to: "/admin/reports",   label: "Reports",        icon: "📈" },
  ],
  hospital_admin: [
    { to: "/hospital",            label: "Dashboard",  icon: "📊", end: true },
    { to: "/hospital/inventory",  label: "Inventory",  icon: "🩸" },
    { to: "/hospital/requests",   label: "Requests",   icon: "📋" },
    { to: "/hospital/donors",     label: "Donors",     icon: "👥" },
    { to: "/hospital/profile",    label: "Profile",    icon: "⚙️" },
  ],
  donor: [
    { to: "/donor",               label: "Dashboard",      icon: "🏠", end: true },
    { to: "/donor/nearby",        label: "Nearby Requests",icon: "📍" },
    { to: "/donor/history",       label: "Donations",      icon: "💉" },
    { to: "/donor/notifications", label: "Notifications",  icon: "🔔" },
    { to: "/donor/profile",       label: "Profile",        icon: "👤" },
  ],
  receiver: [
    { to: "/receiver",               label: "Dashboard",     icon: "🏠", end: true },
    { to: "/receiver/search",        label: "Find Blood",    icon: "🔍" },
    { to: "/receiver/requests",      label: "My Requests",   icon: "📋" },
    { to: "/receiver/notifications", label: "Notifications", icon: "🔔" },
    { to: "/receiver/profile",       label: "Profile",       icon: "👤" },
  ],
};

const ROLE_LABEL = { main_admin: "Main Admin", hospital_admin: "Hospital Admin", donor: "Donor", receiver: "Patient" };

export default function Sidebar() {
  const open    = useSelector(selectSidebar);
  const role    = useSelector(selectCurrentRole);
  const user    = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const items   = NAV[role] || [];

  return (
    <aside style={{
      width: open ? "256px" : "68px",
      transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
      background: "#18181C",
      borderRight: "1px solid #2A2A30",
      display: "flex", flexDirection: "column",
      flexShrink: 0, overflow: "hidden",
    }}>
      {/* Logo row */}
      <div style={{ height: "66px", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 14px", borderBottom: "1px solid #2A2A30", flexShrink: 0 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", overflow: "hidden" }}>
          <span className="heartbeat" style={{ fontSize: "26px", flexShrink: 0 }}>🩸</span>
          {open && <span style={{ fontFamily: "'Syne',sans-serif", fontSize: "19px", fontWeight: 800, color: "#F5F5F7", whiteSpace: "nowrap" }}>Blood<span style={{ color: "#E8192C" }}>Link</span></span>}
        </div>
        <button onClick={() => dispatch(toggleSidebar())}
          style={{ background: "none", border: "none", color: "#8E8E9A", fontSize: "16px", cursor: "pointer", padding: "4px", flexShrink: 0 }}>
          {open ? "◀" : "▶"}
        </button>
      </div>

      {/* User chip */}
      {open && (
        <div style={{ padding: "14px 16px", borderBottom: "1px solid #2A2A30", flexShrink: 0 }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <div style={{ width: "34px", height: "34px", borderRadius: "9px", background: "rgba(232,25,44,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "15px", flexShrink: 0 }}>
              {user?.name?.[0]?.toUpperCase() || "?"}
            </div>
            <div style={{ overflow: "hidden" }}>
              <p style={{ fontSize: "13px", fontWeight: 600, color: "#F5F5F7", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user?.name}</p>
              <p style={{ fontSize: "11px", color: "#E8192C", fontWeight: 600 }}>{ROLE_LABEL[role]}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav items */}
      <nav style={{ flex: 1, padding: "10px 8px", overflowY: "auto" }}>
        {items.map((item) => (
          <NavLink key={item.to} to={item.to} end={item.end}>
            {({ isActive }) => (
              <div style={{
                display: "flex", alignItems: "center", gap: "11px",
                padding: "11px 12px", borderRadius: "10px",
                marginBottom: "2px",
                background: isActive ? "rgba(232,25,44,0.1)" : "transparent",
                borderLeft: isActive ? "3px solid #E8192C" : "3px solid transparent",
                color: isActive ? "#FF4D5E" : "#8E8E9A",
                fontSize: "14px", fontWeight: 500,
                transition: "all 0.15s",
                cursor: "pointer",
              }}>
                <span style={{ fontSize: "18px", flexShrink: 0 }}>{item.icon}</span>
                {open && <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{item.label}</span>}
              </div>
            )}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
