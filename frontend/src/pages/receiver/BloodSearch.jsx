import { useState } from "react";
import toast from "react-hot-toast";
import { useLazySearchHospitalsQuery } from "../../features/hospital/hospitalApi";
import { useCreateRequestMutation } from "../../features/requests/requestsApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import Badge, { BloodBadge } from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

const BG = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];

export default function BloodSearch() {
  const [bloodGroup, setBloodGroup] = useState("");
  const [city, setCity] = useState("");
  const [searched, setSearched] = useState(false);
  const [requestModal, setRequestModal] = useState(null);
  const [reqForm, setReqForm] = useState({ units:"1", urgency:"medium", reason:"", patientName:"" });

  const [searchHospitals, { data, isLoading }] = useLazySearchHospitalsQuery();
  const [createRequest, { isLoading: creating }] = useCreateRequestMutation();

  const results = data?.data || [];

  const handleSearch = () => {
    if (!bloodGroup) { toast.error("Select a blood group"); return; }
    searchHospitals({ bloodGroup, city });
    setSearched(true);
  };

  const handleRequest = async () => {
    try {
      await createRequest({
        hospital: requestModal._id,
        bloodGroup,
        units: parseInt(reqForm.units) || 1,
        urgency: reqForm.urgency,
        reason: reqForm.reason,
        patientName: reqForm.patientName,
      }).unwrap();
      toast.success("Blood request sent!");
      setRequestModal(null);
    } catch (e) { toast.error(e?.data?.message || "Request failed"); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"22px" }}>
      {/* Search box */}
      <Card>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"18px", fontWeight:700, marginBottom:"18px" }}>Find Blood 🔍</h3>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr auto", gap:"14px", alignItems:"flex-end" }}>
          <Input
            label="Blood Group" type="select" value={bloodGroup}
            onChange={(e) => setBloodGroup(e.target.value)}
            options={[{value:"",label:"Select Blood Group"},...BG.map((g)=>({value:g,label:g}))]}
          />
          <Input label="City (Optional)" value={city} onChange={(e) => setCity(e.target.value)} placeholder="Karachi" icon="📍" />
          <Button onClick={handleSearch} loading={isLoading} disabled={!bloodGroup} size="lg">
            Search
          </Button>
        </div>

        {/* Blood group quick-pick */}
        <div style={{ display:"flex", gap:"8px", marginTop:"16px", flexWrap:"wrap" }}>
          {BG.map((g) => (
            <button key={g} onClick={() => {
              setBloodGroup(g);
              searchHospitals({ bloodGroup: g, city });
              setSearched(true);
            }}
              style={{ padding:"6px 14px", borderRadius:"999px", border:`1px solid ${bloodGroup===g?"#E8192C":"#2A2A30"}`, background:bloodGroup===g?"rgba(232,25,44,0.12)":"#1F1F24", color:bloodGroup===g?"#FF4D5E":"#8E8E9A", fontSize:"13px", fontWeight:700, cursor:"pointer", fontFamily:"'Syne',sans-serif" }}>
              {g}
            </button>
          ))}
        </div>
      </Card>

      {/* Results */}
      {isLoading && <div style={{ display:"flex", justifyContent:"center", padding:"40px" }}><Spinner /></div>}

      {searched && !isLoading && (
        <>
          <p style={{ color:"#8E8E9A", fontSize:"14px" }}>
            {results.length === 0
              ? `No hospitals found with available ${bloodGroup} blood${city ? ` in ${city}` : ""}.`
              : `${results.length} hospital(s) have ${bloodGroup} blood available${city ? ` in ${city}` : ""}`
            }
          </p>
          {results.map((h) => (
            <Card key={h._id}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"16px" }}>
                <div>
                  <h4 style={{ fontFamily:"'Syne',sans-serif", fontWeight:700, fontSize:"16px" }}>{h.name}</h4>
                  <p style={{ fontSize:"13px", color:"#8E8E9A", marginTop:"4px" }}>
                    📍 {h.location?.city}{h.location?.address ? `, ${h.location.address}` : ""}
                  </p>
                  {h.contact?.phone && <p style={{ fontSize:"13px", color:"#8E8E9A" }}>📞 {h.contact.phone}</p>}
                  <div style={{ display:"flex", alignItems:"center", gap:"10px", marginTop:"10px" }}>
                    <BloodBadge group={bloodGroup} />
                    <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"22px", fontWeight:800, color:"#22C55E" }}>{h.availableUnits}</span>
                    <span style={{ fontSize:"13px", color:"#8E8E9A" }}>units available</span>
                  </div>
                </div>
                <Button variant="primary" onClick={() => setRequestModal(h)} className="pulse-red">
                  🩸 Request Blood
                </Button>
              </div>
            </Card>
          ))}
        </>
      )}

      {/* Request Modal */}
      {requestModal && (
        <Modal title="Send Blood Request" onClose={() => setRequestModal(null)}>
          <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
            <div style={{ background:"#1F1F24", borderRadius:"12px", padding:"14px", display:"flex", gap:"12px", alignItems:"center" }}>
              <BloodBadge group={bloodGroup} />
              <div>
                <p style={{ fontWeight:600 }}>{requestModal.name}</p>
                <p style={{ fontSize:"12px", color:"#8E8E9A" }}>{requestModal.availableUnits} units available</p>
              </div>
            </div>
            <Input label="Patient Name" value={reqForm.patientName} onChange={(e) => setReqForm({...reqForm,patientName:e.target.value})} placeholder="Name of patient" icon="👤" />
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <Input label="Units Needed" type="number" value={reqForm.units} onChange={(e) => setReqForm({...reqForm,units:e.target.value})} />
              <Input label="Urgency" type="select" value={reqForm.urgency} onChange={(e) => setReqForm({...reqForm,urgency:e.target.value})}
                options={[{value:"low",label:"🟢 Low"},{value:"medium",label:"🔵 Medium"},{value:"high",label:"🟠 High"},{value:"critical",label:"🔴 Critical"}]} />
            </div>
            <Input label="Reason / Notes" type="textarea" value={reqForm.reason} onChange={(e) => setReqForm({...reqForm,reason:e.target.value})} placeholder="Brief reason for the request..." rows={3} />
            <Button full loading={creating} onClick={handleRequest} style={{ marginTop:"4px" }}>
              🩸 Confirm Request
            </Button>
          </div>
        </Modal>
      )}
    </div>
  );
}