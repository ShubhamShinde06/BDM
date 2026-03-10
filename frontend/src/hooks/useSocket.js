import { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { connectSocket, disconnectSocket } from "../socket/socket";
import { selectCurrentToken, selectCurrentRole } from "../features/auth/authSlice";
import { api } from "../app/api";

export default function useSocket() {
  const dispatch = useDispatch();
  const token = useSelector(selectCurrentToken);
  const role  = useSelector(selectCurrentRole);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    if (!token) return;

    const s = connectSocket(token);

    s.on("inventory_changed", () => {
      dispatch(api.util.invalidateTags(["HospitalInventory", "HospitalStats"]));
    });

    s.on("inventory_bulk_updated", () => {
      dispatch(api.util.invalidateTags(["HospitalInventory", "HospitalStats"]));
    });

    s.on("new_blood_request", ({ notification }) => {
      dispatch(api.util.invalidateTags(["HospitalRequests", "HospitalStats", "AdminRequests"]));
      toast(`🩸 ${notification?.title || "New blood request"}`, { style: ts });
    });

    s.on("request_status_update", ({ status }) => {
      dispatch(api.util.invalidateTags(["MyRequests"]));
      const icons = { accepted: "✅", rejected: "❌", completed: "🏆" };
      toast(`${icons[status] || "📋"} Request ${status}`, { style: ts });
    });

    s.on("donor_needed", (n) => {
      dispatch(api.util.invalidateTags(["NearbyRequests"]));
      toast(`🆘 ${n?.title || "Urgent donor needed!"}`, { style: ts, duration: 6000 });
    });

    s.on("donation_recorded", () => {
      dispatch(api.util.invalidateTags(["UserStats", "UserDonations"]));
      toast.success("🏆 Donation recorded!", { style: ts });
    });

    s.on("donor_committed", ({ notification }) => {
      dispatch(api.util.invalidateTags(["MyCommits", "NearbyRequests", "HospitalRequests", "Notifications", "MyRequests"]));
      if (notification?.title) {
        toast(`🚗 ${notification.title}`, { style: ts, duration: 6000 });
      }
    });

    s.on("donor_cancel_commit", () => {
      dispatch(api.util.invalidateTags(["HospitalRequests", "NearbyRequests", "MyRequests"]));
      toast("⚠️ A donor cancelled their commitment", { style: ts });
    });

    s.on("notification", () => {
      dispatch(api.util.invalidateTags(["Notifications"]));
    });

    s.on("low_stock_alert", (n) => {
      toast.error(`⚠️ ${n?.title || "Low stock!"}`, { style: ts });
    });

    s.on("force_logout", ({ reason }) => {
      toast.error(`🚫 ${reason}`);
      setTimeout(() => {
        dispatch({ type: "auth/logout" });
        window.location.href = "/login";
      }, 2000);
    });

    s.on("hospital_approved", () => {
      dispatch(api.util.invalidateTags(["AdminHospitals", "AdminDashboard"]));
    });

    // Only disconnect when component fully unmounts, not on every token change
    return () => {
      const EVENTS = [
        "inventory_changed","inventory_bulk_updated","new_blood_request",
        "request_status_update","donor_needed","donation_recorded","notification",
        "low_stock_alert","force_logout","hospital_approved",
        "donor_committed","donor_cancel_commit",
      ];
      EVENTS.forEach((e) => s.off(e));
      // Only fully disconnect if token is gone (logged out)
      if (!token) disconnectSocket();
    };
  }, [token, role, dispatch]);
}

const ts = { background: "#18181C", color: "#F5F5F7", border: "1px solid #2A2A30", fontFamily: "'DM Sans',sans-serif" };