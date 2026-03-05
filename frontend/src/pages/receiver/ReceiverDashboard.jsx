import { useGetUserProfileQuery, useGetUserStatsQuery } from "../../features/user/userApi";
import { useGetMyRequestsQuery } from "../../features/requests/requestsApi";
import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import Badge, { BloodBadge } from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

export default function ReceiverDashboard() {
  const { data: pd, isLoading: pL } = useGetUserProfileQuery();
  const { data: sd }               = useGetUserStatsQuery();
  const { data: rd }               = useGetMyRequestsQuery({ limit:5 });

  const user    = pd?.data;
  const stats   = sd?.data || {};
  const recent  = rd?.data || [];

  if (pL) return <div style={{ display:"flex", justifyContent:"center", padding:"60px" }}><Spinner /></div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"22px" }}>
      <Card style={{ background:"linear-gradient(135deg,rgba(59,130,246,0.1),rgba(24,24,28,0.95))", border:"1px solid rgba(59,130,246,0.2)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
          <div style={{ width:"58px", height:"58px", borderRadius:"15px", background:"rgba(59,130,246,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px" }}>🆘</div>
          <div>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"20px", fontWeight:700 }}>{user?.name}</h3>
            <div style={{ display:"flex", gap:"8px", marginTop:"6px", alignItems:"center" }}>
              <BloodBadge group={user?.bloodGroup} />
              <Badge status="receiver" />
              <span style={{ fontSize:"12px", color:"#8E8E9A" }}>📍 {user?.location?.city || "—"}</span>
            </div>
          </div>
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:"14px" }}>
        <StatCard icon="⏳" label="Pending"   value={stats.pendingRequests}   color="#F59E0B" />
        <StatCard icon="✅" label="Completed" value={stats.completedRequests} color="#22C55E" />
      </div>

      <Card>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700, marginBottom:"14px" }}>Recent Requests</h3>
        {recent.length === 0
          ? <p style={{ color:"#8E8E9A", textAlign:"center", padding:"24px" }}>No requests yet. Search for blood to make your first request!</p>
          : recent.map((r) => (
            <div key={r._id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid rgba(42,42,48,0.5)", flexWrap:"wrap", gap:"10px" }}>
              <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
                <span style={{ fontSize:"22px" }}>{{ pending:"⏳", accepted:"✅", rejected:"❌", completed:"🏆", cancelled:"🚫" }[r.status]}</span>
                <div>
                  <p style={{ fontWeight:600, fontSize:"14px" }}>{r.hospital?.name||"—"}</p>
                  <p style={{ fontSize:"12px", color:"#8E8E9A" }}>{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
              <div style={{ display:"flex", gap:"8px" }}>
                <BloodBadge group={r.bloodGroup} />
                <Badge status={r.urgency} />
                <Badge status={r.status} />
              </div>
            </div>
          ))
        }
      </Card>
    </div>
  );
}
