import { useState } from "react";
import toast from "react-hot-toast";
import { useGetNearbyRequestsQuery, useCommitToDonateMutation, useCancelCommitMutation, useGetMyCommitsQuery } from "../../features/user/userApi";
import Card from "../../components/ui/Card";
import Badge, { BloodBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";

const URGENCY_COLOR = { critical: "#E8192C", high: "#F59E0B", medium: "#3B82F6", low: "#8E8E9A" };
const ETA_OPTIONS = [15, 20, 30, 45, 60, 90];

export default function NearbyRequests() {
  const [city, setCity]         = useState("");
  const [search, setSearch]     = useState("");
  const [commitModal, setCommitModal] = useState(null); // request object
  const [eta, setEta]           = useState(30);
  const [note, setNote]         = useState("");

  const { data, isLoading, refetch } = useGetNearbyRequestsQuery({ city: search, limit: 20 });
  const { data: commitsData }        = useGetMyCommitsQuery();
  const [commitToDonate, { isLoading: committing }] = useCommitToDonateMutation();
  const [cancelCommit,  { isLoading: cancelling }]  = useCancelCommitMutation();

  const requests = data?.data || [];
  const myCommits = commitsData?.data || [];

  // Check if donor already committed to a specific request
  const isCommitted = (requestId) =>
    myCommits.some((c) => c._id === requestId || c._id?.toString() === requestId?.toString());

  const handleCommit = async () => {
    try {
      const res = await commitToDonate({ requestId: commitModal._id, estimatedArrival: eta, note }).unwrap();
      toast.success(res.message || "Hospital notified! Head over.");
      setCommitModal(null);
      setNote("");
      setEta(30);
    } catch (e) {
      toast.error(e?.data?.message || "Failed to commit");
    }
  };

  const handleCancel = async (requestId) => {
    try {
      const res = await cancelCommit(requestId).unwrap();
      toast(res.message || "Commitment cancelled", { icon: "↩️" });
    } catch (e) {
      toast.error(e?.data?.message || "Failed to cancel");
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

      {/* ── Active Commitments Banner ── */}
      {myCommits.length > 0 && (
        <div style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.2)", borderRadius: "16px", padding: "18px 20px" }}>
          <p style={{ fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "15px", color: "#22C55E", marginBottom: "12px" }}>
            🚗 You have {myCommits.length} active commitment{myCommits.length > 1 ? "s" : ""}
          </p>
          {myCommits.map((c) => (
            <div key={c._id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#18181C", borderRadius: "12px", padding: "14px 16px", marginBottom: "8px", flexWrap: "wrap", gap: "10px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                <BloodBadge group={c.bloodGroup} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: "14px" }}>{c.hospital?.name}</p>
                  <p style={{ fontSize: "12px", color: "#8E8E9A" }}>
                    📍 {c.hospital?.location?.city} • ETA: {c.estimatedArrival} min
                  </p>
                  {c.hospital?.contact?.phone && (
                    <a href={`tel:${c.hospital.contact.phone}`} style={{ fontSize: "12px", color: "#3B82F6" }}>
                      📞 {c.hospital.contact.phone}
                    </a>
                  )}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                <div style={{ background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.25)", borderRadius: "8px", padding: "6px 12px" }}>
                  <p style={{ fontSize: "11px", color: "#22C55E", fontWeight: 700 }}>⏱ {c.estimatedArrival} min ETA</p>
                </div>
                <Button size="sm" variant="danger" loading={cancelling} onClick={() => handleCancel(c._id)}>
                  Cancel
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Search bar ── */}
      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={city} onChange={(e) => setCity(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && setSearch(city)}
          placeholder="Filter by city..."
          style={{ flex: 1, padding: "10px 14px", background: "#1F1F24", border: "1px solid #2A2A30", borderRadius: "10px", color: "#F5F5F7", fontSize: "14px", fontFamily: "'DM Sans',sans-serif", outline: "none" }}
        />
        <Button onClick={() => setSearch(city)}>Search</Button>
        {search && <Button variant="ghost" onClick={() => { setCity(""); setSearch(""); }}>Clear</Button>}
        <Button size="sm" variant="ghost" onClick={refetch}>🔄</Button>
      </div>

      {/* ── Count ── */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <p style={{ color: "#8E8E9A", fontSize: "13px" }}>
          {isLoading ? "Loading..." : `${requests.length} request(s) match your blood group`}
        </p>
        <div style={{ display: "flex", gap: "8px" }}>
          {["critical","high","medium","low"].map((u) => {
            const count = requests.filter(r => r.urgency === u).length;
            return count > 0 ? <Badge key={u} status={u} label={`${count} ${u}`} /> : null;
          })}
        </div>
      </div>

      {/* ── Request Cards ── */}
      {isLoading
        ? <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}><Spinner /></div>
        : requests.length === 0
          ? (
            <Card style={{ textAlign: "center", padding: "56px 24px" }}>
              <div style={{ fontSize: "52px", marginBottom: "14px" }}>✅</div>
              <p style={{ color: "#F5F5F7", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: "17px" }}>
                No pending requests right now
              </p>
              <p style={{ color: "#8E8E9A", fontSize: "13px", marginTop: "8px" }}>
                Keep your availability ON — you'll get notified instantly when a match appears.
              </p>
            </Card>
          )
          : requests.map((r) => {
            const committed = isCommitted(r._id);
            const alreadyHasDonor = r.status === "donor_committed" && !committed;
            const urgColor = URGENCY_COLOR[r.urgency] || "#8E8E9A";
            const minutesAgo = Math.round((Date.now() - new Date(r.createdAt)) / 60000);

            return (
              <Card key={r._id} style={{ borderLeft: `3px solid ${urgColor}`, position: "relative", opacity: alreadyHasDonor ? 0.65 : 1 }}>
                {/* Urgency pulse for critical */}
                {r.urgency === "critical" && (
                  <div style={{ position: "absolute", top: "14px", right: "14px", width: "10px", height: "10px", borderRadius: "50%", background: "#E8192C", animation: "pulse 1.5s ease-in-out infinite" }} />
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px" }}>
                  {/* Left info */}
                  <div style={{ display: "flex", gap: "16px", alignItems: "flex-start" }}>
                    <BloodBadge group={r.bloodGroup} />
                    <div>
                      <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap", marginBottom: "4px" }}>
                        <p style={{ fontWeight: 700, fontSize: "16px" }}>
                          {r.requester?.name || "Patient"}
                        </p>
                        <Badge status={r.urgency} />
                        {alreadyHasDonor && (
                          <span style={{ fontSize: "11px", background: "rgba(34,197,94,0.12)", color: "#22C55E", padding: "2px 8px", borderRadius: "999px", fontWeight: 700 }}>
                            Donor en route
                          </span>
                        )}
                      </div>
                      <p style={{ fontSize: "13px", color: "#8E8E9A" }}>
                        🏥 {r.hospital?.name}
                      </p>
                      <p style={{ fontSize: "13px", color: "#8E8E9A" }}>
                        📍 {r.hospital?.location?.city}{r.hospital?.location?.address ? `, ${r.hospital.location.address}` : ""}
                      </p>
                      <div style={{ display: "flex", gap: "14px", marginTop: "6px", flexWrap: "wrap" }}>
                        <span style={{ fontSize: "12px", color: "#8E8E9A" }}>🩸 {r.units} unit{r.units > 1 ? "s" : ""} needed</span>
                        <span style={{ fontSize: "12px", color: "#8E8E9A" }}>🕐 {minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.round(minutesAgo/60)}h ago`}</span>
                        {r.hospital?.contact?.phone && (
                          <a href={`tel:${r.hospital.contact.phone}`} style={{ fontSize: "12px", color: "#3B82F6", textDecoration: "none" }}>
                            📞 {r.hospital.contact.phone}
                          </a>
                        )}
                      </div>
                      {r.reason && (
                        <p style={{ fontSize: "12px", color: "#4A4A55", marginTop: "5px", fontStyle: "italic" }}>
                          "{r.reason}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right actions */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-end" }}>
                    {committed ? (
                      <div style={{ textAlign: "center" }}>
                        <div style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.3)", borderRadius: "10px", padding: "10px 16px", marginBottom: "6px" }}>
                          <p style={{ fontSize: "12px", color: "#22C55E", fontWeight: 700 }}>✅ You're going!</p>
                          <p style={{ fontSize: "11px", color: "#8E8E9A" }}>Hospital notified</p>
                        </div>
                        <Button size="sm" variant="danger" loading={cancelling} onClick={() => handleCancel(r._id)}>
                          Cancel
                        </Button>
                      </div>
                    ) : alreadyHasDonor ? (
                      <div style={{ background: "rgba(34,197,94,0.07)", border: "1px solid rgba(34,197,94,0.15)", borderRadius: "10px", padding: "10px 14px", textAlign: "center" }}>
                        <p style={{ fontSize: "12px", color: "#22C55E" }}>Another donor is on the way</p>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => { setCommitModal(r); setEta(30); setNote(""); }}
                        style={{ animation: r.urgency === "critical" ? "pulse-red 2s ease-in-out infinite" : "none" }}
                      >
                        🚗 I'm Coming!
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
      }

      {/* ── Commit Modal ── */}
      {commitModal && (
        <Modal title="Confirm — I'm Coming to Donate" onClose={() => setCommitModal(null)}>
          <div style={{marginTop: "200px"}}>

           <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
            {/* Hospital summary */}
            <div style={{ background: "#1F1F24", borderRadius: "12px", padding: "16px", display: "flex", gap: "14px", alignItems: "center" }}>
              <BloodBadge group={commitModal.bloodGroup} />
              <div>
                <p style={{ fontWeight: 700 }}>{commitModal.hospital?.name}</p>
                <p style={{ fontSize: "13px", color: "#8E8E9A" }}>
                  📍 {commitModal.hospital?.location?.city}
                  {commitModal.hospital?.location?.address ? `, ${commitModal.hospital.location.address}` : ""}
                </p>
                {commitModal.hospital?.contact?.phone && (
                  <a href={`tel:${commitModal.hospital.contact.phone}`} style={{ fontSize: "13px", color: "#3B82F6" }}>
                    📞 {commitModal.hospital.contact.phone}
                  </a>
                )}
              </div>
            </div>

            {/* What happens info box */}
            <div style={{ background: "rgba(59,130,246,0.07)", border: "1px solid rgba(59,130,246,0.18)", borderRadius: "12px", padding: "14px 16px" }}>
              <p style={{ fontSize: "13px", color: "#3B82F6", fontWeight: 700, marginBottom: "6px" }}>ℹ️ What happens next</p>
              <p style={{ fontSize: "12px", color: "#8E8E9A", lineHeight: 1.6 }}>
                The hospital and patient will be notified immediately. This request will be locked for you — other donors won't be able to claim it. Head to the hospital and present yourself at the blood bank.
              </p>
            </div>

            {/* ETA picker */}
            <div>
              <p style={{ fontSize: "11px", color: "#8E8E9A", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "10px", fontFamily: "'Syne',sans-serif" }}>
                Estimated Arrival Time
              </p>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                {ETA_OPTIONS.map((m) => (
                  <button key={m} onClick={() => setEta(m)} style={{
                    padding: "8px 16px", borderRadius: "999px",
                    border: `1px solid ${eta === m ? "#E8192C" : "#2A2A30"}`,
                    background: eta === m ? "rgba(232,25,44,0.1)" : "#1F1F24",
                    color: eta === m ? "#FF4D5E" : "#8E8E9A",
                    fontSize: "13px", fontWeight: 700, cursor: "pointer", fontFamily: "'DM Sans',sans-serif"
                  }}>
                    {m} min
                  </button>
                ))}
              </div>
            </div>

            {/* Optional note */}
            <div>
              <p style={{ fontSize: "11px", color: "#8E8E9A", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px", fontFamily: "'Syne',sans-serif" }}>
                Note to hospital (optional)
              </p>
              <textarea
                value={note} onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. I'll be there in 20 mins, coming by bike..."
                rows={2}
                style={{ width: "100%", padding: "10px 14px", background: "#1F1F24", border: "1px solid #2A2A30", borderRadius: "10px", color: "#F5F5F7", fontSize: "13px", fontFamily: "'DM Sans',sans-serif", outline: "none", resize: "vertical" }}
              />
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Button full loading={committing} onClick={handleCommit}>
                🚗 Confirm — I'm Coming ({eta} min)
              </Button>
              <Button full variant="ghost" onClick={() => setCommitModal(null)}>
                Cancel
              </Button>
            </div>
          </div> 
          </div>
          
        </Modal>
      )}
    </div>
  );
}