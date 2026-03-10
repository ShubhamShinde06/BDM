import { useState } from "react";
import toast from "react-hot-toast";
import { useGetMyRequestsQuery, useCancelRequestMutation } from "../../features/requests/requestsApi";
import Card from "../../components/ui/Card";
import Badge, { BloodBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

const STATUS_ICON = { pending:"⏳", donor_committed:"🚗", accepted:"✅", rejected:"❌", completed:"🏆", cancelled:"🚫" };
const STATUS_LABEL = { pending:"Pending", donor_committed:"Donor Coming", accepted:"Accepted", rejected:"Rejected", completed:"Done", cancelled:"Cancelled" };

export default function MyRequests() {
  const [statusFilter, setStatusFilter] = useState("");
  const { data, isLoading } = useGetMyRequestsQuery({ status: statusFilter, limit:20 });
  const [cancelReq, { isLoading: cancelling }] = useCancelRequestMutation();
  const requests = data?.data || [];

  const handleCancel = async (id) => {
    try { await cancelReq(id).unwrap(); toast.success("Request cancelled"); }
    catch (e) { toast.error(e?.data?.message || "Failed"); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      {/* Summary cards */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(100px,1fr))", gap:"10px" }}>
        {Object.entries(STATUS_ICON).map(([s, icon]) => (
          <button key={s} onClick={() => setStatusFilter(statusFilter===s?"":s)}
            style={{ background: statusFilter===s?"rgba(232,25,44,0.1)":"#18181C", border:`1px solid ${statusFilter===s?"#E8192C":"#2A2A30"}`, borderRadius:"12px", padding:"14px 10px", textAlign:"center", cursor:"pointer", transition:"all 0.15s" }}>
            <p style={{ fontSize:"22px", marginBottom:"4px" }}>{icon}</p>
            <p style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:800, color:"#F5F5F7" }}>
              {requests.filter(r=>r.status===s).length}
            </p>
            <p style={{ fontSize:"11px", color:"#8E8E9A", textTransform:"capitalize" }}>{STATUS_LABEL[s]}</p>
          </button>
        ))}
      </div>

      {isLoading
        ? <div style={{ display:"flex", justifyContent:"center", padding:"60px" }}><Spinner /></div>
        : requests.length === 0
          ? <Card style={{ textAlign:"center", padding:"48px" }}><div style={{ fontSize:"40px", marginBottom:"12px" }}>📋</div><p style={{ color:"#8E8E9A" }}>No requests found.</p></Card>
          : requests.map((r) => (
            <Card key={r._id}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"14px" }}>
                <div style={{ display:"flex", gap:"14px", alignItems:"flex-start" }}>
                  <span style={{ fontSize:"26px" }}>{STATUS_ICON[r.status] || "📋"}</span>
                  <div>
                    <p style={{ fontWeight:700, fontSize:"15px" }}>{r.hospital?.name || "—"}</p>
                    <p style={{ fontSize:"13px", color:"#8E8E9A", marginTop:"3px" }}>
                      Request #{r._id?.slice(-6)} • {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                    <p style={{ fontSize:"13px", color:"#8E8E9A" }}>
                      📍 {r.hospital?.location?.city} • {r.units} unit(s)
                    </p>
                    {/* Show donor ETA if committed */}
                    {r.status === "donor_committed" && (
                      <p style={{ fontSize:"12px", color:"#22C55E", marginTop:"4px", fontWeight:600 }}>
                        🚗 A donor is on the way! ETA: {r.estimatedArrival} min
                      </p>
                    )}
                    {r.rejectionReason && (
                      <p style={{ fontSize:"12px", color:"#FF4D5E", marginTop:"4px" }}>
                        Reason: {r.rejectionReason}
                      </p>
                    )}
                  </div>
                </div>
                <div style={{ display:"flex", gap:"8px", alignItems:"center", flexWrap:"wrap" }}>
                  <BloodBadge group={r.bloodGroup} />
                  <Badge status={r.urgency} />
                  <Badge status={r.status} />
                  {r.status === "pending" && (
                    <Button size="sm" variant="danger" loading={cancelling} onClick={() => handleCancel(r._id)}>
                      Cancel
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
      }
    </div>
  );
}