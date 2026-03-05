import { useState } from "react";
import toast from "react-hot-toast";
import { useGetAdminHospitalsQuery, useUpdateHospitalStatusMutation } from "../../features/admin/adminApi";
import { Table, Td, EmptyRow } from "../../components/ui/Table";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";

export default function AdminHospitals() {
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const { data, isLoading } = useGetAdminHospitalsQuery({ status, page, limit: 15 });
  const [updateStatus, { isLoading: updating }] = useUpdateHospitalStatusMutation();
  const hospitals = data?.data || [];

  const handle = async (id, newStatus) => {
    try {
      await updateStatus({ id, status: newStatus }).unwrap();
      toast.success(`Hospital ${newStatus}`);
    } catch (e) { toast.error(e?.data?.message || "Failed"); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <div style={{ display:"flex", gap:"10px", flexWrap:"wrap" }}>
        {["","pending","approved","rejected","suspended"].map((s) => (
          <button key={s} onClick={() => { setStatus(s); setPage(1); }}
            style={{ padding:"7px 16px", borderRadius:"999px", border:`1px solid ${status===s?"#E8192C":"#2A2A30"}`, background: status===s?"rgba(232,25,44,0.1)":"#1F1F24", color: status===s?"#FF4D5E":"#8E8E9A", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            {s || "All"}
          </button>
        ))}
      </div>

      <Card style={{ padding:0 }}>
        <div style={{ padding:"18px 22px", borderBottom:"1px solid #2A2A30", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700 }}>
            Hospitals ({data?.total || 0})
          </h3>
          <div style={{ display:"flex", gap:"8px" }}>
            <Badge status="pending" label={`${hospitals.filter(h=>h.status==="pending").length} Pending`} />
            <Badge status="approved" label={`${hospitals.filter(h=>h.status==="approved").length} Approved`} />
          </div>
        </div>
        <Table columns={["Hospital","License","Location","Contact","Status","Actions"]} loading={isLoading}>
          {hospitals.length === 0 && !isLoading
            ? <EmptyRow cols={6} message="No hospitals found" icon="🏥" />
            : hospitals.map((h) => (
              <tr key={h._id}>
                <Td><p style={{ fontWeight:600 }}>{h.name}</p><p style={{ fontSize:"12px", color:"#8E8E9A" }}>{h.email}</p></Td>
                <Td><code style={{ fontSize:"12px", background:"#1F1F24", padding:"2px 8px", borderRadius:"6px", color:"#3B82F6" }}>{h.licenseNumber}</code></Td>
                <Td style={{ color:"#8E8E9A", fontSize:"13px" }}>📍 {h.location?.city}</Td>
                <Td style={{ color:"#8E8E9A", fontSize:"13px" }}>{h.contact?.phone || "—"}</Td>
                <Td><Badge status={h.status} /></Td>
                <Td>
                  <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                    {h.status === "pending" && (<>
                      <Button size="sm" variant="success" loading={updating} onClick={() => handle(h._id,"approved")}>✓ Approve</Button>
                      <Button size="sm" variant="danger"  loading={updating} onClick={() => handle(h._id,"rejected")}>✕ Reject</Button>
                    </>)}
                    {h.status === "approved" && (
                      <Button size="sm" variant="warning" onClick={() => handle(h._id,"suspended")}>Suspend</Button>
                    )}
                    {h.status === "suspended" && (
                      <Button size="sm" variant="success" onClick={() => handle(h._id,"approved")}>Restore</Button>
                    )}
                  </div>
                </Td>
              </tr>
            ))
          }
        </Table>
        {/* Pagination */}
        {data?.pages > 1 && (
          <div style={{ display:"flex", justifyContent:"center", gap:"8px", padding:"14px" }}>
            {Array.from({ length: data.pages }, (_, i) => i+1).map((p) => (
              <button key={p} onClick={() => setPage(p)} style={{ width:"32px", height:"32px", borderRadius:"8px", border:"1px solid #2A2A30", background: page===p?"#E8192C":"#1F1F24", color: page===p?"#fff":"#8E8E9A", cursor:"pointer", fontFamily:"'DM Sans',sans-serif", fontWeight:600 }}>{p}</button>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
