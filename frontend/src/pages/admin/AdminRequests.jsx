import { useState } from "react";
import { useGetAdminRequestsQuery } from "../../features/admin/adminApi";
import { Table, Td, EmptyRow } from "../../components/ui/Table";
import Badge, { BloodBadge } from "../../components/ui/Badge";
import Card from "../../components/ui/Card";

export default function AdminRequests() {
  const [filters, setFilters] = useState({ status:"", bloodGroup:"", urgency:"" });
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAdminRequestsQuery({ ...filters, page, limit:15 });
  const requests = data?.data || [];
  const setF = (k,v) => { setFilters((p)=>({...p,[k]:v})); setPage(1); };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <Card style={{ padding:"16px 20px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:"12px" }}>
          {[["status",["","pending","donor_committed","accepted","rejected","completed","cancelled"]],
            ["urgency",["","critical","high","medium","low"]],
            ["bloodGroup",["","A+","A-","B+","B-","O+","O-","AB+","AB-"]]].map(([key,opts])=>(
            <select key={key} value={filters[key]} onChange={(e)=>setF(key,e.target.value)} style={sel}>
              {opts.map((o)=><option key={o} value={o}>{o||`All ${key.charAt(0).toUpperCase()+key.slice(1)}s`}</option>)}
            </select>
          ))}
        </div>
      </Card>

      <Card style={{ padding:0 }}>
        <div style={{ padding:"18px 22px", borderBottom:"1px solid #2A2A30" }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700 }}>All Requests ({data?.total || 0})</h3>
        </div>
        <Table columns={["Patient","Blood","Hospital","Urgency","Date","Status"]} loading={isLoading}>
          {requests.length===0 && !isLoading
            ? <EmptyRow cols={6} message="No requests found" icon="📋" />
            : requests.map((r)=>(
              <tr key={r._id}>
                <Td><p style={{ fontWeight:600 }}>{r.requester?.name||"—"}</p><p style={{ fontSize:"12px", color:"#8E8E9A" }}>{r.requester?.email}</p></Td>
                <Td><BloodBadge group={r.bloodGroup} /></Td>
                <Td style={{ fontSize:"13px", color:"#8E8E9A" }}>{r.hospital?.name||"—"}</Td>
                <Td><Badge status={r.urgency} /></Td>
                <Td style={{ fontSize:"13px", color:"#8E8E9A" }}>{new Date(r.createdAt).toLocaleDateString()}</Td>
                <Td><Badge status={r.status} /></Td>
              </tr>
            ))
          }
        </Table>
        {data?.pages > 1 && (
          <div style={{ display:"flex", justifyContent:"center", gap:"8px", padding:"14px" }}>
            {Array.from({length:data.pages},(_,i)=>i+1).map((p)=>(
              <button key={p} onClick={()=>setPage(p)} style={{ width:"32px", height:"32px", borderRadius:"8px", border:"1px solid #2A2A30", background:page===p?"#E8192C":"#1F1F24", color:page===p?"#fff":"#8E8E9A", cursor:"pointer" }}>{p}</button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

const sel = { width:"100%", padding:"10px 14px", background:"#1F1F24", border:"1px solid #2A2A30", borderRadius:"10px", color:"#F5F5F7", fontSize:"13px", fontFamily:"'DM Sans',sans-serif", outline:"none" };