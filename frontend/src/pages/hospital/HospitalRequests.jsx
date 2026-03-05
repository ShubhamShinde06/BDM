import { useState } from "react";
import toast from "react-hot-toast";
import { useGetHospitalRequestsQuery, useRespondToRequestMutation, useCompleteRequestMutation } from "../../features/requests/requestsApi";
import { Table, Td, EmptyRow } from "../../components/ui/Table";
import Badge, { BloodBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";

export default function HospitalRequests() {
  const [statusFilter, setStatusFilter] = useState("");
  const [rejectModal, setRejectModal] = useState(null);
  const [rejectReason, setRejectReason] = useState("");

  const { data, isLoading } = useGetHospitalRequestsQuery({ status: statusFilter, limit: 20 });
  const [respond, { isLoading: responding }] = useRespondToRequestMutation();
  const [complete, { isLoading: completing }] = useCompleteRequestMutation();

  const requests = data?.data || [];

  const handleAccept = async (id) => {
    try {
      await respond({ id, status:"accepted" }).unwrap();
      toast.success("Request accepted! Blood units deducted.");
    } catch (e) { toast.error(e?.data?.message || "Failed"); }
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error("Please provide a rejection reason"); return; }
    try {
      await respond({ id: rejectModal, status:"rejected", rejectionReason: rejectReason }).unwrap();
      toast.success("Request rejected");
      setRejectModal(null); setRejectReason("");
    } catch (e) { toast.error(e?.data?.message || "Failed"); }
  };

  const handleComplete = async (id) => {
    try {
      await complete({ id }).unwrap();
      toast.success("Donation marked complete!");
    } catch (e) { toast.error(e?.data?.message || "Failed"); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
        {["","pending","accepted","rejected","completed"].map((s) => (
          <button key={s} onClick={() => setStatusFilter(s)}
            style={{ padding:"7px 16px", borderRadius:"999px", border:`1px solid ${statusFilter===s?"#E8192C":"#2A2A30"}`, background:statusFilter===s?"rgba(232,25,44,0.1)":"#1F1F24", color:statusFilter===s?"#FF4D5E":"#8E8E9A", fontSize:"13px", fontWeight:600, cursor:"pointer", fontFamily:"'DM Sans',sans-serif" }}>
            {s || "All"}
          </button>
        ))}
      </div>

      <Card style={{ padding:0 }}>
        <div style={{ padding:"18px 22px", borderBottom:"1px solid #2A2A30" }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700 }}>
            Requests ({data?.total || 0})
          </h3>
        </div>
        <Table columns={["Patient","Blood","Units","Urgency","Date","Status","Actions"]} loading={isLoading}>
          {requests.length===0 && !isLoading
            ? <EmptyRow cols={7} message="No requests found" icon="📋" />
            : requests.map((r) => (
              <tr key={r._id}>
                <Td>
                  <p style={{ fontWeight:600 }}>{r.requester?.name||"—"}</p>
                  <p style={{ fontSize:"12px", color:"#8E8E9A" }}>{r.requester?.phone||r.requester?.email}</p>
                </Td>
                <Td><BloodBadge group={r.bloodGroup} /></Td>
                <Td style={{ fontWeight:700 }}>{r.units}</Td>
                <Td><Badge status={r.urgency} /></Td>
                <Td style={{ fontSize:"13px", color:"#8E8E9A" }}>{new Date(r.createdAt).toLocaleDateString()}</Td>
                <Td><Badge status={r.status} /></Td>
                <Td>
                  <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
                    {r.status === "pending" && (<>
                      <Button size="xs" variant="success" loading={responding} onClick={() => handleAccept(r._id)}>✓ Accept</Button>
                      <Button size="xs" variant="danger"  onClick={() => { setRejectModal(r._id); setRejectReason(""); }}>✕ Reject</Button>
                    </>)}
                    {r.status === "accepted" && (
                      <Button size="xs" variant="info" loading={completing} onClick={() => handleComplete(r._id)}>🏆 Complete</Button>
                    )}
                  </div>
                </Td>
              </tr>
            ))
          }
        </Table>
      </Card>

      {rejectModal && (
        <Modal title="Reject Request" onClose={() => { setRejectModal(null); setRejectReason(""); }}>
          <Input label="Reason for rejection" type="textarea" value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} placeholder="Explain why you're rejecting this request..." rows={3} />
          <div style={{ display:"flex", gap:"10px", marginTop:"16px" }}>
            <Button full variant="danger" loading={responding} onClick={handleReject}>Confirm Reject</Button>
            <Button full variant="ghost" onClick={() => setRejectModal(null)}>Cancel</Button>
          </div>
        </Modal>
      )}
    </div>
  );
}
