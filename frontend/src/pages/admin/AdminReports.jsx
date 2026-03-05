import { useGetAdminDashboardQuery } from "../../features/admin/adminApi";
import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import Spinner from "../../components/ui/Spinner";

const MONTHS = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export default function AdminReports() {
  const { data, isLoading } = useGetAdminDashboardQuery();
  if (isLoading) return <div style={{ display:"flex", justifyContent:"center", padding:"60px" }}><Spinner /></div>;

  const s = data?.data?.stats || {};
  const donations = data?.data?.monthlyDonations || [];
  const requests  = data?.data?.monthlyRequests  || [];
  const allCounts = [...donations.map(d=>d.count), ...requests.map(r=>r.count), 1];
  const max = Math.max(...allCounts);

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"24px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"14px" }}>
        <StatCard icon="💉" label="Total Donations" value={s.totalDonations?.toLocaleString()} color="#22C55E" />
        <StatCard icon="📋" label="Total Requests"  value={s.totalRequests?.toLocaleString()}  color="#F59E0B" />
        <StatCard icon="✅" label="Acceptance Rate" value={s.totalRequests ? `${Math.round(((s.totalRequests-s.pendingRequests)/s.totalRequests)*100)}%` : "—"} color="#3B82F6" />
        <StatCard icon="🏥" label="Active Hospitals" value={s.totalHospitals?.toLocaleString()} color="#8B5CF6" />
      </div>

      <Card>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700, marginBottom:"20px" }}>Monthly Donations vs Requests</h3>
        {donations.length === 0
          ? <p style={{ color:"#8E8E9A", textAlign:"center", padding:"30px" }}>No data available yet</p>
          : (
            <>
              <div style={{ display:"flex", alignItems:"flex-end", gap:"10px", height:"180px" }}>
                {donations.map((d, i) => {
                  const r = requests[i] || { count:0 };
                  const month = MONTHS[(d._id?.month||1)-1];
                  return (
                    <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", height:"100%", justifyContent:"flex-end", gap:"6px" }}>
                      <div style={{ width:"100%", display:"flex", gap:"3px", alignItems:"flex-end" }}>
                        <div style={{ flex:1, height:`${(d.count/max)*160}px`, background:"linear-gradient(to top,#22C55E,rgba(34,197,94,0.3))", borderRadius:"4px 4px 0 0", minHeight:"2px", position:"relative" }}>
                          <span style={{ position:"absolute", top:"-18px", left:"50%", transform:"translateX(-50%)", fontSize:"10px", color:"#22C55E", whiteSpace:"nowrap" }}>{d.count}</span>
                        </div>
                        <div style={{ flex:1, height:`${(r.count/max)*160}px`, background:"linear-gradient(to top,#E8192C,rgba(232,25,44,0.3))", borderRadius:"4px 4px 0 0", minHeight:"2px", position:"relative" }}>
                          <span style={{ position:"absolute", top:"-18px", left:"50%", transform:"translateX(-50%)", fontSize:"10px", color:"#E8192C", whiteSpace:"nowrap" }}>{r.count}</span>
                        </div>
                      </div>
                      <span style={{ fontSize:"10px", color:"#8E8E9A" }}>{month}</span>
                    </div>
                  );
                })}
              </div>
              <div style={{ display:"flex", gap:"18px", marginTop:"16px" }}>
                <div style={{ display:"flex", alignItems:"center", gap:"7px" }}><div style={{ width:"12px", height:"12px", borderRadius:"3px", background:"#22C55E" }} /><span style={{ fontSize:"12px", color:"#8E8E9A" }}>Donations</span></div>
                <div style={{ display:"flex", alignItems:"center", gap:"7px" }}><div style={{ width:"12px", height:"12px", borderRadius:"3px", background:"#E8192C" }} /><span style={{ fontSize:"12px", color:"#8E8E9A" }}>Requests</span></div>
              </div>
            </>
          )}
      </Card>
    </div>
  );
}
