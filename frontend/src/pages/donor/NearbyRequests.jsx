import { useState, useEffect } from "react";
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
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const [commitModal, setCommitModal] = useState(null);
  const [eta, setEta] = useState(30);
  const [note, setNote] = useState("");
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1200);

  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const { data, isLoading, refetch } = useGetNearbyRequestsQuery({ city: search, limit: 20 });
  const { data: commitsData } = useGetMyCommitsQuery();
  const [commitToDonate, { isLoading: committing }] = useCommitToDonateMutation();
  const [cancelCommit, { isLoading: cancelling }] = useCancelCommitMutation();

  const requests = data?.data || [];
  const myCommits = commitsData?.data || [];

  const isMobile = windowWidth < 640;
  const isTablet = windowWidth >= 640 && windowWidth < 1024;

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

  // Animation styles
  const pulseAnimation = `
    @keyframes pulse {
      0% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.5; transform: scale(1.1); }
      100% { opacity: 1; transform: scale(1); }
    }
    @keyframes pulse-red {
      0% { background-color: rgba(232, 25, 44, 0.2); }
      50% { background-color: rgba(232, 25, 44, 0.4); }
      100% { background-color: rgba(232, 25, 44, 0.2); }
    }
  `;

  return (
    <>
      <style>{pulseAnimation}</style>
      <div style={{ 
        display: "flex", 
        flexDirection: "column", 
        gap: isMobile ? "16px" : "20px",
        padding: isMobile ? "12px" : "0"
      }}>

        {/* Active Commitments Banner */}
        {myCommits.length > 0 && (
          <div style={{ 
            background: "rgba(34,197,94,0.07)", 
            border: "1px solid rgba(34,197,94,0.2)", 
            borderRadius: "16px", 
            padding: isMobile ? "16px" : "18px 20px" 
          }}>
            <p style={{ 
              fontFamily: "'Syne',sans-serif", 
              fontWeight: 700, 
              fontSize: isMobile ? "14px" : "15px", 
              color: "#22C55E", 
              marginBottom: "12px" 
            }}>
              🚗 You have {myCommits.length} active commitment{myCommits.length > 1 ? "s" : ""}
            </p>
            {myCommits.map((c) => (
              <div key={c._id} style={{ 
                display: "flex", 
                flexDirection: isMobile ? "column" : "row",
                justifyContent: "space-between", 
                alignItems: isMobile ? "stretch" : "center", 
                background: "#18181C", 
                borderRadius: "12px", 
                padding: isMobile ? "16px" : "14px 16px", 
                marginBottom: "8px", 
                gap: isMobile ? "12px" : "10px" 
              }}>
                <div style={{ 
                  display: "flex", 
                  gap: "12px", 
                  alignItems: "center",
                  flexDirection: isMobile ? "column" : "row",
                  textAlign: isMobile ? "center" : "left"
                }}>
                  <BloodBadge group={c.bloodGroup} />
                  <div>
                    <p style={{ fontWeight: 700, fontSize: isMobile ? "15px" : "14px" }}>{c.hospital?.name}</p>
                    <p style={{ fontSize: "12px", color: "#8E8E9A" }}>
                      📍 {c.hospital?.location?.city} • ETA: {c.estimatedArrival} min
                    </p>
                    {c.hospital?.contact?.phone && (
                      <a href={`tel:${c.hospital.contact.phone}`} style={{ fontSize: "12px", color: "#3B82F6", display: "inline-block", marginTop: "4px" }}>
                        📞 {c.hospital.contact.phone}
                      </a>
                    )}
                  </div>
                </div>
                <div style={{ 
                  display: "flex", 
                  gap: "8px", 
                  alignItems: "center",
                  justifyContent: isMobile ? "space-between" : "flex-end"
                }}>
                  <div style={{ 
                    background: "rgba(34,197,94,0.12)", 
                    border: "1px solid rgba(34,197,94,0.25)", 
                    borderRadius: "8px", 
                    padding: "6px 12px" 
                  }}>
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

        {/* Search Bar */}
        <div style={{ 
          display: "flex", 
          gap: "8px",
          flexDirection: isMobile ? "column" : "row"
        }}>
          <input
            value={city} 
            onChange={(e) => setCity(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && setSearch(city)}
            placeholder="Filter by city..."
            style={{ 
              flex: 1, 
              padding: "12px 14px", 
              background: "#1F1F24", 
              border: "1px solid #2A2A30", 
              borderRadius: "10px", 
              color: "#F5F5F7", 
              fontSize: isMobile ? "16px" : "14px",
              fontFamily: "'DM Sans',sans-serif", 
              outline: "none",
              width: isMobile ? "100%" : "auto"
            }}
          />
          <div style={{ 
            display: "flex", 
            gap: "8px",
            width: isMobile ? "100%" : "auto"
          }}>
            <Button onClick={() => setSearch(city)} full={isMobile}>Search</Button>
            {search && (
              <Button variant="ghost" onClick={() => { setCity(""); setSearch(""); }} full={isMobile}>
                Clear
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={refetch} full={isMobile}>🔄</Button>
          </div>
        </div>

        {/* Count and Filters */}
        <div style={{ 
          display: "flex", 
          flexDirection: isMobile ? "column" : "row",
          justifyContent: "space-between", 
          alignItems: isMobile ? "flex-start" : "center",
          gap: isMobile ? "12px" : "0"
        }}>
          <p style={{ color: "#8E8E9A", fontSize: isMobile ? "12px" : "13px" }}>
            {isLoading ? "Loading..." : `${requests.length} request(s) match your blood group`}
          </p>
          <div style={{ 
            display: "flex", 
            gap: "8px",
            flexWrap: "wrap"
          }}>
            {["critical", "high", "medium", "low"].map((u) => {
              const count = requests.filter(r => r.urgency === u).length;
              return count > 0 ? (
                <Badge key={u} status={u} label={isMobile ? `${count}` : `${count} ${u}`} />
              ) : null;
            })}
          </div>
        </div>

        {/* Request Cards */}
        {isLoading ? (
          <div style={{ display: "flex", justifyContent: "center", padding: "60px" }}>
            <Spinner />
          </div>
        ) : requests.length === 0 ? (
          <Card style={{ textAlign: "center", padding: isMobile ? "40px 16px" : "56px 24px" }}>
            <div style={{ fontSize: isMobile ? "42px" : "52px", marginBottom: "14px" }}>✅</div>
            <p style={{ color: "#F5F5F7", fontFamily: "'Syne',sans-serif", fontWeight: 700, fontSize: isMobile ? "16px" : "17px" }}>
              No pending requests right now
            </p>
            <p style={{ color: "#8E8E9A", fontSize: isMobile ? "12px" : "13px", marginTop: "8px" }}>
              Keep your availability ON — you'll get notified instantly when a match appears.
            </p>
          </Card>
        ) : (
          requests.map((r) => {
            const committed = isCommitted(r._id);
            const alreadyHasDonor = r.status === "donor_committed" && !committed;
            const urgColor = URGENCY_COLOR[r.urgency] || "#8E8E9A";
            const minutesAgo = Math.round((Date.now() - new Date(r.createdAt)) / 60000);

            return (
              <Card key={r._id} style={{ 
                borderLeft: `3px solid ${urgColor}`, 
                position: "relative", 
                opacity: alreadyHasDonor ? 0.65 : 1,
                padding: isMobile ? "16px" : "20px"
              }}>
                {/* Urgency pulse for critical */}
                {r.urgency === "critical" && (
                  <div style={{ 
                    position: "absolute", 
                    top: "14px", 
                    right: "14px", 
                    width: "10px", 
                    height: "10px", 
                    borderRadius: "50%", 
                    background: "#E8192C", 
                    animation: "pulse 1.5s ease-in-out infinite" 
                  }} />
                )}

                <div style={{ 
                  display: "flex", 
                  flexDirection: isMobile ? "column" : "row",
                  justifyContent: "space-between", 
                  alignItems: isMobile ? "stretch" : "flex-start", 
                  gap: "16px" 
                }}>
                  {/* Left info */}
                  <div style={{ 
                    display: "flex", 
                    gap: "16px", 
                    alignItems: "flex-start",
                    flexDirection: isMobile ? "column" : "row"
                  }}>
                    <BloodBadge group={r.bloodGroup} />
                    <div style={{ width: "100%" }}>
                      <div style={{ 
                        display: "flex", 
                        gap: "8px", 
                        alignItems: "center", 
                        flexWrap: "wrap", 
                        marginBottom: "4px",
                        flexDirection: isMobile ? "column" : "row",
                        alignItems: isMobile ? "flex-start" : "center"
                      }}>
                        <p style={{ fontWeight: 700, fontSize: isMobile ? "16px" : "16px" }}>
                          {r.requester?.name || "Patient"}
                        </p>
                        <Badge status={r.urgency} />
                        {alreadyHasDonor && (
                          <span style={{ 
                            fontSize: "11px", 
                            background: "rgba(34,197,94,0.12)", 
                            color: "#22C55E", 
                            padding: "2px 8px", 
                            borderRadius: "999px", 
                            fontWeight: 700 
                          }}>
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
                      <div style={{ 
                        display: "flex", 
                        gap: "14px", 
                        marginTop: "6px", 
                        flexWrap: "wrap",
                        flexDirection: isMobile ? "column" : "row"
                      }}>
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
                  <div style={{ 
                    display: "flex", 
                    flexDirection: isMobile ? "row" : "column", 
                    gap: "8px", 
                    alignItems: isMobile ? "stretch" : "flex-end",
                    justifyContent: isMobile ? "space-between" : "flex-end",
                    marginTop: isMobile ? "8px" : "0"
                  }}>
                    {committed ? (
                      <>
                        <div style={{ 
                          background: "rgba(34,197,94,0.1)", 
                          border: "1px solid rgba(34,197,94,0.3)", 
                          borderRadius: "10px", 
                          padding: isMobile ? "8px 12px" : "10px 16px", 
                          textAlign: "center",
                          flex: isMobile ? 1 : "none"
                        }}>
                          <p style={{ fontSize: "12px", color: "#22C55E", fontWeight: 700 }}>✅ You're going!</p>
                          <p style={{ fontSize: "11px", color: "#8E8E9A" }}>Hospital notified</p>
                        </div>
                        <Button 
                          size="sm" 
                          variant="danger" 
                          loading={cancelling} 
                          onClick={() => handleCancel(r._id)}
                          full={isMobile}
                        >
                          Cancel
                        </Button>
                      </>
                    ) : alreadyHasDonor ? (
                      <div style={{ 
                        background: "rgba(34,197,94,0.07)", 
                        border: "1px solid rgba(34,197,94,0.15)", 
                        borderRadius: "10px", 
                        padding: isMobile ? "8px 12px" : "10px 14px", 
                        textAlign: "center",
                        width: isMobile ? "100%" : "auto"
                      }}>
                        <p style={{ fontSize: "12px", color: "#22C55E" }}>Another donor is on the way</p>
                      </div>
                    ) : (
                      <Button
                        variant="primary"
                        onClick={() => { setCommitModal(r); setEta(30); setNote(""); }}
                        style={{ 
                          animation: r.urgency === "critical" ? "pulse-red 2s ease-in-out infinite" : "none",
                          width: isMobile ? "100%" : "auto"
                        }}
                        full={isMobile}
                      >
                        🚗 I'm Coming!
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Commit Modal - Centered Popup */}
      {commitModal && (
        <Modal title="Confirm Donation" onClose={() => setCommitModal(null)}>
          <div style={{ 
            maxWidth: "500px",
            width: isMobile ? "95vw" : "500px",
            margin: "0 auto"
          }}>
            <div style={{ 
              display: "flex", 
              flexDirection: "column", 
              gap: isMobile ? "16px" : "20px",
              padding: isMobile ? "16px" : "20px"
            }}>
              
              {/* Hospital summary */}
              <div style={{ 
                background: "#1F1F24", 
                borderRadius: "12px", 
                padding: isMobile ? "14px" : "16px", 
                display: "flex", 
                gap: "14px", 
                alignItems: "center",
                flexDirection: isMobile ? "column" : "row",
                textAlign: isMobile ? "center" : "left"
              }}>
                <BloodBadge group={commitModal.bloodGroup} />
                <div>
                  <p style={{ fontWeight: 700, fontSize: isMobile ? "15px" : "16px" }}>{commitModal.hospital?.name}</p>
                  <p style={{ fontSize: "13px", color: "#8E8E9A" }}>
                    📍 {commitModal.hospital?.location?.city}
                    {commitModal.hospital?.location?.address ? `, ${commitModal.hospital.location.address}` : ""}
                  </p>
                  {commitModal.hospital?.contact?.phone && (
                    <a href={`tel:${commitModal.hospital.contact.phone}`} style={{ fontSize: "13px", color: "#3B82F6", display: "inline-block", marginTop: "4px" }}>
                      📞 {commitModal.hospital.contact.phone}
                    </a>
                  )}
                </div>
              </div>

              {/* What happens info box */}
              <div style={{ 
                background: "rgba(59,130,246,0.07)", 
                border: "1px solid rgba(59,130,246,0.18)", 
                borderRadius: "12px", 
                padding: isMobile ? "14px" : "16px" 
              }}>
                <p style={{ fontSize: "13px", color: "#3B82F6", fontWeight: 700, marginBottom: "6px" }}>ℹ️ What happens next</p>
                <p style={{ fontSize: isMobile ? "12px" : "13px", color: "#8E8E9A", lineHeight: 1.6 }}>
                  The hospital and patient will be notified immediately. This request will be locked for you — other donors won't be able to claim it. Head to the hospital and present yourself at the blood bank.
                </p>
              </div>

              {/* ETA picker */}
              <div>
                <p style={{ 
                  fontSize: "11px", 
                  color: "#8E8E9A", 
                  fontWeight: 700, 
                  letterSpacing: "0.08em", 
                  textTransform: "uppercase", 
                  marginBottom: "10px", 
                  fontFamily: "'Syne',sans-serif" 
                }}>
                  Estimated Arrival Time
                </p>
                <div style={{ 
                  display: "grid", 
                  gridTemplateColumns: isMobile ? "repeat(3, 1fr)" : "repeat(6, 1fr)",
                  gap: "8px"
                }}>
                  {ETA_OPTIONS.map((m) => (
                    <button 
                      key={m} 
                      onClick={() => setEta(m)} 
                      style={{
                        padding: isMobile ? "8px 4px" : "8px 16px",
                        borderRadius: "999px",
                        border: `1px solid ${eta === m ? "#E8192C" : "#2A2A30"}`,
                        background: eta === m ? "rgba(232,25,44,0.1)" : "#1F1F24",
                        color: eta === m ? "#FF4D5E" : "#8E8E9A",
                        fontSize: isMobile ? "12px" : "13px",
                        fontWeight: 700,
                        cursor: "pointer",
                        fontFamily: "'DM Sans',sans-serif",
                        width: "100%"
                      }}
                    >
                      {m} min
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional note */}
              <div>
                <p style={{ 
                  fontSize: "11px", 
                  color: "#8E8E9A", 
                  fontWeight: 700, 
                  letterSpacing: "0.08em", 
                  textTransform: "uppercase", 
                  marginBottom: "8px", 
                  fontFamily: "'Syne',sans-serif" 
                }}>
                  Note to hospital (optional)
                </p>
                <textarea
                  value={note} 
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. I'll be there in 20 mins, coming by bike..."
                  rows={isMobile ? 3 : 2}
                  style={{ 
                    width: "100%", 
                    padding: "12px 14px", 
                    background: "#1F1F24", 
                    border: "1px solid #2A2A30", 
                    borderRadius: "10px", 
                    color: "#F5F5F7", 
                    fontSize: isMobile ? "14px" : "13px",
                    fontFamily: "'DM Sans',sans-serif", 
                    outline: "none", 
                    resize: "vertical" 
                  }}
                />
              </div>

              <div style={{ 
                display: "flex", 
                gap: "10px",
                flexDirection: isMobile ? "column" : "row"
              }}>
                <Button 
                  full 
                  loading={committing} 
                  onClick={handleCommit}
                  style={{ flex: isMobile ? "none" : 1 }}
                >
                  🚗 Confirm — I'm Coming ({eta} min)
                </Button>
                <Button 
                  full 
                  variant="ghost" 
                  onClick={() => setCommitModal(null)}
                  style={{ flex: isMobile ? "none" : 1 }}
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </>
  );
}