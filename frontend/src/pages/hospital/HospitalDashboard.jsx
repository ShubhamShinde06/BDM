import { useGetHospitalStatsQuery } from "../../features/hospital/hospitalApi";
import { useGetHospitalRequestsQuery } from "../../features/requests/requestsApi";
import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import Badge, { BloodBadge } from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

export default function HospitalDashboard() {
  const { data: statsData, isLoading: statsLoading } = useGetHospitalStatsQuery();
  const { data: reqData } = useGetHospitalRequestsQuery({ limit: 8 });

  const s = statsData?.data || {};
  const allRecent = reqData?.data || [];
  // Show pending + donor_committed in dashboard
  const actionable = allRecent.filter(r => r.status === "pending" || r.status === "donor_committed");

  if (statsLoading) return <div style={{ display:"flex", justifyContent:"center", padding:"60px" }}><Spinner /></div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"22px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"14px" }}>
        <StatCard icon="🩸" label="Total Units"    value={s.totalUnits}       sub="In inventory"             color="#E8192C" />
        <StatCard icon="📋" label="Total Requests" value={s.totalRequests}    sub={`${s.pendingRequests||0} pending`} color="#F59E0B" />
        <StatCard icon="✅" label="Accepted"        value={s.acceptedRequests} sub="Total accepted"           color="#22C55E" />
        <StatCard icon="💉" label="Donations"       value={s.totalDonations}   sub="Recorded"                 color="#3B82F6" />
      </div>

      {s.criticalGroups?.length > 0 && (
        <div style={{ background:"rgba(232,25,44,0.07)", border:"1px solid rgba(232,25,44,0.2)", borderRadius:"14px", padding:"16px 20px" }}>
          <p style={{ fontWeight:700, color:"#FF4D5E", fontSize:"14px", marginBottom:"8px" }}>🚨 Critical Blood Stock</p>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
            {s.criticalGroups.map((g) => <BloodBadge key={g} group={g} />)}
          </div>
          <p style={{ fontSize:"12px", color:"#8E8E9A", marginTop:"8px" }}>These blood groups have 3 or fewer units. Restock immediately.</p>
        </div>
      )}

      <Card>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700, marginBottom:"16px" }}>
          Action Required ({actionable.length})
        </h3>
        {actionable.length === 0
          ? <p style={{ color:"#8E8E9A", textAlign:"center", padding:"24px" }}>No pending requests 🎉</p>
          : actionable.map((r) => (
            <div key={r._id} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"12px 0", borderBottom:"1px solid rgba(42,42,48,0.5)", flexWrap:"wrap", gap:"10px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                <BloodBadge group={r.bloodGroup} />
                <div>
                  <p style={{ fontWeight:600, fontSize:"14px" }}>{r.requester?.name || "—"}</p>
                  <p style={{ fontSize:"12px", color:"#8E8E9A" }}>
                    {new Date(r.createdAt).toLocaleDateString()} • {r.units} unit(s)
                  </p>
                  {r.status === "donor_committed" && r.committedDonor && (
                    <p style={{ fontSize:"11px", color:"#22C55E", marginTop:"2px" }}>
                      🚗 {r.committedDonor.name} coming • ETA {r.estimatedArrival}min
                    </p>
                  )}
                </div>
              </div>
              <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
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