import toast from "react-hot-toast";
import { useGetNotificationsQuery, useMarkNotificationReadMutation, useMarkAllReadMutation } from "../../features/user/userApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

const TYPE_ICON = {
  request_new:      "🆘",
  request_accepted: "✅",
  request_rejected: "❌",
  hospital_approved:"🎉",
  hospital_rejected:"❌",
  donor_needed:     "🩸",
  donation_complete:"🏆",
  low_stock_alert:  "⚠️",
  system:           "ℹ️",
};

export default function NotificationsPage() {
  const { data, isLoading } = useGetNotificationsQuery({ limit:50 });
  const [markRead]    = useMarkNotificationReadMutation();
  const [markAll, { isLoading: markingAll }] = useMarkAllReadMutation();

  const notifications = data?.data || [];
  const unread = data?.unreadCount || 0;

  const handleMarkRead = async (id) => {
    try { await markRead(id).unwrap(); } catch {}
  };

  const handleMarkAll = async () => {
    try { await markAll().unwrap(); toast.success("All marked as read"); }
    catch { toast.error("Failed"); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <div>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"18px", fontWeight:700 }}>Notifications</h3>
          {unread > 0 && <p style={{ fontSize:"13px", color:"#8E8E9A", marginTop:"3px" }}>{unread} unread</p>}
        </div>
        {unread > 0 && (
          <Button size="sm" variant="ghost" loading={markingAll} onClick={handleMarkAll}>
            ✓ Mark All Read
          </Button>
        )}
      </div>

      {isLoading
        ? <div style={{ display:"flex", justifyContent:"center", padding:"60px" }}><Spinner /></div>
        : notifications.length === 0
          ? (
            <Card style={{ textAlign:"center", padding:"48px" }}>
              <div style={{ fontSize:"44px", marginBottom:"12px" }}>🔔</div>
              <p style={{ color:"#8E8E9A" }}>No notifications yet</p>
            </Card>
          )
          : notifications.map((n) => (
            <div key={n._id}
              onClick={() => !n.isRead && handleMarkRead(n._id)}
              style={{ display:"flex", gap:"14px", padding:"16px 18px", background: n.isRead?"#18181C":"#1F1F24", border:`1px solid ${n.isRead?"#2A2A30":"rgba(232,25,44,0.2)"}`, borderRadius:"14px", cursor: n.isRead?"default":"pointer", transition:"all 0.15s" }}>
              <div style={{ width:"40px", height:"40px", borderRadius:"11px", background: n.isRead?"rgba(42,42,48,0.8)":"rgba(232,25,44,0.1)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"18px", flexShrink:0 }}>
                {TYPE_ICON[n.type] || "📬"}
              </div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", gap:"10px" }}>
                  <p style={{ fontWeight: n.isRead?500:700, fontSize:"14px", color: n.isRead?"#8E8E9A":"#F5F5F7" }}>{n.title}</p>
                  {!n.isRead && <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"#E8192C", flexShrink:0, marginTop:"4px" }} />}
                </div>
                <p style={{ fontSize:"13px", color:"#8E8E9A", marginTop:"3px", lineHeight:1.5 }}>{n.message}</p>
                <p style={{ fontSize:"11px", color:"#4A4A55", marginTop:"6px" }}>{new Date(n.createdAt).toLocaleString()}</p>
              </div>
            </div>
          ))
      }
    </div>
  );
}
