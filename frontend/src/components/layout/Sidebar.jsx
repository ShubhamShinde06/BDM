import { NavLink } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { useState, useEffect } from "react";
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
    { to: "/donor",               label: "Dashboard",       icon: "🏠", end: true },
    { to: "/donor/nearby",        label: "Nearby Requests", icon: "📍" },
    { to: "/donor/history",       label: "Donations",       icon: "💉" },
    { to: "/donor/notifications", label: "Notifications",   icon: "🔔" },
    { to: "/donor/profile",       label: "Profile",         icon: "👤" },
  ],
  receiver: [
    { to: "/receiver",               label: "Dashboard",     icon: "🏠", end: true },
    { to: "/receiver/search",        label: "Find Blood",    icon: "🔍" },
    { to: "/receiver/requests",      label: "My Requests",   icon: "📋" },
    { to: "/receiver/notifications", label: "Notifications", icon: "🔔" },
    { to: "/receiver/profile",       label: "Profile",       icon: "👤" },
  ],
};

const ROLE_LABEL = {
  main_admin:    "Main Admin",
  hospital_admin: "Hospital Admin",
  donor:         "Donor",
  receiver:      "Patient",
};

export default function Sidebar() {
  const open = useSelector(selectSidebar);
  const role = useSelector(selectCurrentRole);
  const user = useSelector(selectCurrentUser);
  const dispatch = useDispatch();
  const items = NAV[role] || [];
  
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const sidebarWidth = isMobile ? (mobileMenuOpen ? "280px" : "0px") : (open ? "256px" : "68px");
  const sidebarVisible = isMobile ? mobileMenuOpen : true;

  // Close mobile menu when route changes
  useEffect(() => {
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  }, [window.location.pathname]);

  // Mobile overlay click handler
  const handleOverlayClick = () => {
    setMobileMenuOpen(false);
  };

  // Animation styles
  const overlayStyle = {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0, 0, 0, 0.5)",
    backdropFilter: "blur(2px)",
    zIndex: 999,
    opacity: mobileMenuOpen ? 1 : 0,
    visibility: mobileMenuOpen ? "visible" : "hidden",
    transition: "opacity 0.3s ease, visibility 0.3s ease",
  };

  const mobileToggleStyle = {
    position: "fixed",
    bottom: "20px",
    right: "20px",
    width: "56px",
    height: "56px",
    borderRadius: "50%",
    background: "#E8192C",
    color: "white",
    border: "none",
    fontSize: "24px",
    cursor: "pointer",
    display: isMobile ? "flex" : "none",
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 12px rgba(232, 25, 44, 0.3)",
    zIndex: 1001,
    transition: "transform 0.2s ease",
  };

  return (
    <>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        style={mobileToggleStyle}
        onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
      >
        {mobileMenuOpen ? "✕" : "☰"}
      </button>

      {/* Mobile Overlay */}
      <div style={overlayStyle} onClick={handleOverlayClick} />

      {/* Sidebar */}
      <aside style={{
        width: sidebarWidth,
        transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
        background: "#18181C",
        borderRight: isMobile ? "none" : "1px solid #2A2A30",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
        overflow: "hidden",
        position: isMobile ? "fixed" : "relative",
        top: isMobile ? 0 : "auto",
        left: isMobile ? 0 : "auto",
        zIndex: isMobile ? 1000 : "auto",
        height: isMobile ? "100vh" : "auto",
        boxShadow: isMobile && mobileMenuOpen ? "4px 0 20px rgba(0, 0, 0, 0.3)" : "none",
      }}>

        {/* Logo row */}
        <div style={{
          height: isMobile ? "60px" : "66px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: isMobile ? "0 16px" : "0 14px",
          borderBottom: "1px solid #2A2A30",
          flexShrink: 0,
        }}>
          {/* Logo icon */}
          <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: isMobile ? "8px" : "10px", 
            overflow: "hidden", 
            flex: 1, 
            minWidth: 0 
          }}>
            <img
              src="/logo.ico"
              alt="BloodLink"
              style={{
                width: isMobile ? "32px" : (open ? "38px" : "32px"),
                height: isMobile ? "32px" : (open ? "38px" : "32px"),
                objectFit: "contain",
                flexShrink: 0,
                transition: "width 0.28s, height 0.28s",
              }}
            />
            {(open || isMobile) && (
              <span style={{
                fontFamily: "sans-serif",
                fontSize: isMobile ? "14px" : "15px",
                fontWeight: 800,
                color: "#F5F5F7",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}>
                <span style={{ color: "#E8192C" }}>Blood</span>
                {isMobile ? "Donation Management" : " Donation Management"}
              </span>
            )}
          </div>

          {/* Desktop toggle button */}
          {!isMobile && (
            <button
              onClick={() => dispatch(toggleSidebar())}
              style={{
                background: "none",
                border: "none",
                color: "#8E8E9A",
                fontSize: "16px",
                cursor: "pointer",
                padding: "4px",
                flexShrink: 0,
                marginLeft: "6px",
              }}
            >
              {open ? "◀" : "▶"}
            </button>
          )}

          {/* Mobile close button */}
          {isMobile && (
            <button
              onClick={() => setMobileMenuOpen(false)}
              style={{
                background: "none",
                border: "none",
                color: "#8E8E9A",
                fontSize: "20px",
                cursor: "pointer",
                padding: "4px",
                flexShrink: 0,
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* User chip */}
        {(open || isMobile) && (
          <div style={{ 
            padding: isMobile ? "16px" : "14px 16px", 
            borderBottom: "1px solid #2A2A30", 
            flexShrink: 0 
          }}>
            <div style={{ 
              display: "flex", 
              alignItems: "center", 
              gap: isMobile ? "12px" : "10px" 
            }}>
              <div style={{
                width: isMobile ? "40px" : "34px",
                height: isMobile ? "40px" : "34px",
                borderRadius: isMobile ? "12px" : "9px",
                background: "rgba(232,25,44,0.15)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: isMobile ? "18px" : "15px",
                flexShrink: 0,
              }}>
                {user?.name?.[0]?.toUpperCase() || "?"}
              </div>
              <div style={{ overflow: "hidden" }}>
                <p style={{ 
                  fontSize: isMobile ? "14px" : "13px", 
                  fontWeight: 600, 
                  color: "#F5F5F7", 
                  overflow: "hidden", 
                  textOverflow: "ellipsis", 
                  whiteSpace: "nowrap" 
                }}>
                  {user?.name}
                </p>
                <p style={{ 
                  fontSize: isMobile ? "12px" : "11px", 
                  color: "#E8192C", 
                  fontWeight: 600 
                }}>
                  {ROLE_LABEL[role]}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Nav items */}
        <nav style={{ 
          flex: 1, 
          padding: isMobile ? "16px" : "10px 8px", 
          overflowY: "auto",
          overflowX: "hidden"
        }}>
          {items.map((item) => (
            <NavLink 
              key={item.to} 
              to={item.to} 
              end={item.end}
              onClick={() => isMobile && setMobileMenuOpen(false)}
            >
              {({ isActive }) => (
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: isMobile ? "14px" : "11px",
                  padding: isMobile ? "14px 16px" : "11px 12px",
                  borderRadius: isMobile ? "12px" : "10px",
                  marginBottom: isMobile ? "4px" : "2px",
                  background: isActive ? "rgba(232,25,44,0.1)" : "transparent",
                  borderLeft: isActive ? `3px solid #E8192C` : "3px solid transparent",
                  color: isActive ? "#FF4D5E" : "#8E8E9A",
                  fontSize: isMobile ? "15px" : "14px",
                  fontWeight: 500,
                  transition: "all 0.15s",
                  cursor: "pointer",
                }}>
                  <span style={{ 
                    fontSize: isMobile ? "20px" : "18px", 
                    flexShrink: 0 
                  }}>
                    {item.icon}
                  </span>
                  {(open || isMobile) && (
                    <span style={{ 
                      whiteSpace: "nowrap", 
                      overflow: "hidden", 
                      textOverflow: "ellipsis" 
                    }}>
                      {item.label}
                    </span>
                  )}
                </div>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Mobile Footer */}
        {isMobile && (
          <div style={{
            padding: "16px",
            borderTop: "1px solid #2A2A30",
            fontSize: "11px",
            color: "#8E8E9A",
            textAlign: "center"
          }}>
            BDM v1.0
          </div>
        )}
      </aside>

      {/* Responsive Styles */}
      <style>{`
        @media (max-width: 768px) {
          body {
            overflow-x: hidden;
          }
          
          /* Prevent body scroll when mobile menu is open */
          body.sidebar-open {
            overflow: hidden;
          }
        }
        
        /* Smooth scrolling for nav */
        nav {
          scrollbar-width: thin;
          scrollbar-color: #2A2A30 #18181C;
        }
        
        nav::-webkit-scrollbar {
          width: 4px;
        }
        
        nav::-webkit-scrollbar-track {
          background: #18181C;
        }
        
        nav::-webkit-scrollbar-thumb {
          background-color: #2A2A30;
          border-radius: 4px;
        }
      `}</style>

      {/* Update body class for mobile menu */}
      {isMobile && (
        <script dangerouslySetInnerHTML={{
          __html: `
            document.body.classList.toggle('sidebar-open', ${mobileMenuOpen});
          `
        }} />
      )}
    </>
  );
}