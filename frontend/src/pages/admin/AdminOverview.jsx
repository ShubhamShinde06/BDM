import { useGetAdminDashboardQuery } from "../../features/admin/adminApi";
import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import Badge, { BloodBadge } from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

export default function AdminOverview() {
  const { data, isLoading } = useGetAdminDashboardQuery(undefined, { pollingInterval: 30000 });

  if (isLoading) return <div style={{ display:"flex", justifyContent:"center", padding:"60px" }}><Spinner size={36} /></div>;

  const s = data?.data?.stats || {};
  const blood = data?.data?.bloodAvailability || {};
  const donations = data?.data?.monthlyDonations || [];
  const requests  = data?.data?.monthlyRequests  || [];
  const max = Math.max(...donations.map((d)=>d.count), ...requests.map((r)=>r.count), 1);

  const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"24px" }}>
      {/* Stats */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"14px" }}>
        <StatCard icon="👥" label="Total Users"      value={s.totalUsers?.toLocaleString()}     sub="Registered users"    color="#3B82F6" />
        <StatCard icon="🏥" label="Hospitals"         value={s.totalHospitals?.toLocaleString()} sub={`${s.pendingHospitals||0} pending`} color="#22C55E" />
        <StatCard icon="📋" label="Blood Requests"    value={s.totalRequests?.toLocaleString()}  sub={`${s.pendingRequests||0} pending`}  color="#F59E0B" />
        <StatCard icon="🩸" label="Available Units"   value={s.availableUnits?.toLocaleString()} sub="Across all hospitals" color="#E8192C" />
        <StatCard icon="💉" label="Total Donations"   value={s.totalDonations?.toLocaleString()} sub="All time"            color="#8B5CF6" />
      </div>

      {/* Pending approval alert */}
      {s.pendingHospitals > 0 && (
        <div style={{ background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:"14px", padding:"16px 20px", display:"flex", alignItems:"center", gap:"12px" }}>
          <span style={{ fontSize:"22px" }}>⚠️</span>
          <div>
            <p style={{ fontWeight:700, color:"#F59E0B", fontSize:"14px" }}>{s.pendingHospitals} Hospital(s) Awaiting Approval</p>
            <p style={{ fontSize:"13px", color:"#8E8E9A" }}>Review hospital registrations in the Hospitals section.</p>
          </div>
        </div>
      )}

      {/* Blood availability */}
      <Card>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700, marginBottom:"18px" }}>Blood Availability (All Hospitals)</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"10px" }}>
          {Object.entries(blood).map(([grp, units]) => (
            <div key={grp} style={{ background:"#1F1F24", borderRadius:"12px", padding:"14px", textAlign:"center", border:`1px solid ${units<5?"rgba(232,25,44,0.3)":"#2A2A30"}` }}>
              <BloodBadge group={grp} />
              <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"22px", fontWeight:800, color: units<5?"#FF4D5E":units<15?"#F59E0B":"#F5F5F7", marginTop:"8px" }}>{units}</p>
              <div style={{ height:"4px", background:"#2A2A30", borderRadius:"999px", overflow:"hidden", marginTop:"6px" }}>
                <div style={{ height:"100%", width:`${Math.min((units/50)*100,100)}%`, background: units<5?"#E8192C":units<15?"#F59E0B":"#22C55E", borderRadius:"999px" }} />
              </div>
              <p style={{ fontSize:"11px", color:"#8E8E9A", marginTop:"4px" }}>units</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Monthly chart */}
      <Card>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700, marginBottom:"20px" }}>Monthly Trend</h3>
        <div style={{ display:"flex", alignItems:"flex-end", gap:"10px", height:"140px" }}>
          {donations.slice(-7).map((d, i) => {
            const r = requests[i] || { count:0 };
            const month = MONTHS[(d._id?.month||1)-1];
            return (
              <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", height:"100%", justifyContent:"flex-end", gap:"6px" }}>
                <div style={{ width:"100%", display:"flex", gap:"3px", alignItems:"flex-end" }}>
                  <div title={`Donations: ${d.count}`} style={{ flex:1, height:`${(d.count/max)*120}px`, background:"linear-gradient(to top,rgba(34,197,94,0.8),rgba(34,197,94,0.3))", borderRadius:"4px 4px 0 0", minHeight:"2px" }} />
                  <div title={`Requests: ${r.count}`}  style={{ flex:1, height:`${(r.count/max)*120}px`, background:"linear-gradient(to top,rgba(232,25,44,0.8),rgba(232,25,44,0.3))",  borderRadius:"4px 4px 0 0", minHeight:"2px" }} />
                </div>
                <span style={{ fontSize:"11px", color:"#8E8E9A" }}>{month}</span>
              </div>
            );
          })}
        </div>
        <div style={{ display:"flex", gap:"18px", marginTop:"14px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"7px" }}><div style={{ width:"12px", height:"12px", borderRadius:"3px", background:"#22C55E" }} /><span style={{ fontSize:"12px", color:"#8E8E9A" }}>Donations</span></div>
          <div style={{ display:"flex", alignItems:"center", gap:"7px" }}><div style={{ width:"12px", height:"12px", borderRadius:"3px", background:"#E8192C" }} /><span style={{ fontSize:"12px", color:"#8E8E9A" }}>Requests</span></div>
        </div>
      </Card>
    </div>
  );
}
