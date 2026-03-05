import { useGetAdminDashboardQuery } from "../../features/admin/adminApi";
import Card from "../../components/ui/Card";
import Badge, { BloodBadge } from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

export default function AdminInventory() {
  const { data, isLoading } = useGetAdminDashboardQuery();
  const blood = data?.data?.bloodAvailability || {};

  if (isLoading) return <div style={{ display:"flex", justifyContent:"center", padding:"60px" }}><Spinner /></div>;

  const groups = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <Card>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700, marginBottom:"20px" }}>Global Blood Inventory</h3>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"14px" }}>
          {groups.map((g) => {
            const units = blood[g] || 0;
            const pct = Math.min((units / 60) * 100, 100);
            const color = units < 5 ? "#E8192C" : units < 15 ? "#F59E0B" : "#22C55E";
            return (
              <div key={g} style={{ background:"#1F1F24", border:`1px solid ${units<5?"rgba(232,25,44,0.3)":"#2A2A30"}`, borderRadius:"14px", padding:"18px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                  <BloodBadge group={g} />
                  <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"26px", fontWeight:800, color }}>{units}</span>
                </div>
                <div style={{ height:"6px", background:"#2A2A30", borderRadius:"999px", overflow:"hidden" }}>
                  <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:"999px", transition:"width 0.6s ease" }} />
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:"8px" }}>
                  <span style={{ fontSize:"11px", color:"#8E8E9A" }}>units available</span>
                  {units < 5 && <span style={{ fontSize:"11px", color:"#E8192C", fontWeight:700 }}>CRITICAL</span>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      <div style={{ padding:"16px 20px", background:"rgba(59,130,246,0.06)", border:"1px solid rgba(59,130,246,0.15)", borderRadius:"14px" }}>
        <p style={{ fontSize:"13px", color:"#3B82F6" }}>ℹ️ This shows aggregated inventory across all approved hospitals. Manage individual hospital inventory from each hospital's dashboard.</p>
      </div>
    </div>
  );
}
