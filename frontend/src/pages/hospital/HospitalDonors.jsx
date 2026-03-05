import { useState } from "react";
import { useGetHospitalDonorsQuery } from "../../features/hospital/hospitalApi";
import { Table, Td, EmptyRow } from "../../components/ui/Table";
import Badge, { BloodBadge } from "../../components/ui/Badge";
import Card from "../../components/ui/Card";

const BG = ["","A+","A-","B+","B-","O+","O-","AB+","AB-"];

export default function HospitalDonors() {
  const [filters, setFilters] = useState({ bloodGroup:"", availability:"" });
  const { data, isLoading } = useGetHospitalDonorsQuery(filters);
  const donors = data?.data || [];
  const setF = (k,v) => setFilters((p) => ({ ...p, [k]: v }));

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <Card style={{ padding:"16px 20px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"12px" }}>
          <select value={filters.bloodGroup} onChange={(e) => setF("bloodGroup",e.target.value)} style={sel}>
            {BG.map((g) => <option key={g} value={g}>{g || "All Blood Groups"}</option>)}
          </select>
          <select value={filters.availability} onChange={(e) => setF("availability",e.target.value)} style={sel}>
            <option value="">All Donors</option>
            <option value="true">Available Now</option>
            <option value="false">Not Available</option>
          </select>
        </div>
      </Card>

      <Card style={{ padding:0 }}>
        <div style={{ padding:"18px 22px", borderBottom:"1px solid #2A2A30", display:"flex", justifyContent:"space-between" }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700 }}>Donors ({data?.total || 0})</h3>
          <Badge status="active" label={`${donors.filter(d=>d.availability).length} Available`} />
        </div>
        <Table columns={["Name","Blood Group","Location","Phone","Donations","Availability","Online"]} loading={isLoading}>
          {donors.length===0 && !isLoading
            ? <EmptyRow cols={7} message="No donors found" icon="👥" />
            : donors.map((d) => (
              <tr key={d._id}>
                <Td><p style={{ fontWeight:600 }}>{d.name}</p><p style={{ fontSize:"12px", color:"#8E8E9A" }}>{d.email}</p></Td>
                <Td><BloodBadge group={d.bloodGroup} /></Td>
                <Td style={{ color:"#8E8E9A", fontSize:"13px" }}>📍 {d.location?.city||"—"}</Td>
                <Td style={{ color:"#8E8E9A", fontSize:"13px" }}>{d.phone||"—"}</Td>
                <Td style={{ fontWeight:700 }}>{d.totalDonations||0}</Td>
                <Td><Badge status={d.availability?"available":"unavailable"} /></Td>
                <Td>
                  <div style={{ display:"flex", alignItems:"center", gap:"6px" }}>
                    <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:d.isOnline?"#22C55E":"#8E8E9A" }} />
                    <span style={{ fontSize:"12px", color:d.isOnline?"#22C55E":"#8E8E9A" }}>{d.isOnline?"Online":"Offline"}</span>
                  </div>
                </Td>
              </tr>
            ))
          }
        </Table>
      </Card>
    </div>
  );
}

const sel = { width:"100%", padding:"10px 14px", background:"#1F1F24", border:"1px solid #2A2A30", borderRadius:"10px", color:"#F5F5F7", fontSize:"13px", fontFamily:"'DM Sans',sans-serif", outline:"none" };
