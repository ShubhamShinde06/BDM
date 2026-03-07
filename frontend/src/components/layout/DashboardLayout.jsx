import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import useSocket from "../../hooks/useSocket";

export default function DashboardLayout() {
  useSocket(); // connect socket.io for real-time events

  return (
    <div style={{ display: "flex", height: "100vh", background: "#111114", overflow: "hidden" }}>
      <Sidebar />
      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <Topbar />
        <main style={{ flex: 1, overflowY: "auto", padding: "28px"}}>
          <div className="fade-up">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
