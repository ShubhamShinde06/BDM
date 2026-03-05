import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useGetHospitalProfileQuery, useUpdateHospitalProfileMutation } from "../../features/hospital/hospitalApi";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

export default function HospitalProfile() {
  const { data, isLoading } = useGetHospitalProfileQuery();
  const [update, { isLoading: saving }] = useUpdateHospitalProfileMutation();
  const h = data?.data;

  const [form, setForm] = useState({ name:"", "contact.phone":"", "contact.website":"", "location.city":"", "location.address":"" });

  useEffect(() => {
    if (h) setForm({ name: h.name||"", "contact.phone": h.contact?.phone||"", "contact.website": h.contact?.website||"", "location.city": h.location?.city||"", "location.address": h.location?.address||"" });
  }, [h]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await update({ name: form.name, contact: { phone: form["contact.phone"], website: form["contact.website"] }, location: { city: form["location.city"], address: form["location.address"], country: h?.location?.country || "Pakistan" } }).unwrap();
      toast.success("Profile updated!");
    } catch (e) { toast.error(e?.data?.message || "Update failed"); }
  };

  if (isLoading) return <div style={{ display:"flex", justifyContent:"center", padding:"60px" }}><Spinner /></div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px", maxWidth:"620px" }}>
      <Card>
        <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"20px" }}>
          <div style={{ width:"56px", height:"56px", borderRadius:"14px", background:"rgba(232,25,44,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"24px" }}>🏥</div>
          <div>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"18px", fontWeight:700 }}>{h?.name}</h3>
            <div style={{ display:"flex", gap:"8px", marginTop:"4px" }}>
              <Badge status={h?.status} />
              <span style={{ fontSize:"12px", color:"#8E8E9A" }}>{h?.licenseNumber}</span>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
          <Input label="Hospital Name" value={form.name} onChange={(e) => setForm({...form, name:e.target.value})} icon="🏥" />
          <Input label="Email" value={h?.email||""} readOnly icon="✉" />
          <Input label="License Number" value={h?.licenseNumber||""} readOnly icon="📋" />
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <Input label="Phone" value={form["contact.phone"]} onChange={(e) => setForm({...form,"contact.phone":e.target.value})} icon="📞" />
            <Input label="Website" value={form["contact.website"]} onChange={(e) => setForm({...form,"contact.website":e.target.value})} icon="🌐" />
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <Input label="City" value={form["location.city"]} onChange={(e) => setForm({...form,"location.city":e.target.value})} icon="📍" />
            <Input label="Address" value={form["location.address"]} onChange={(e) => setForm({...form,"location.address":e.target.value})} icon="🗺" />
          </div>
          <Button type="submit" loading={saving} style={{ alignSelf:"flex-start" }}>Save Changes</Button>
        </form>
      </Card>

      <Card>
        <h4 style={{ fontFamily:"'Syne',sans-serif", fontSize:"14px", fontWeight:700, marginBottom:"12px", color:"#8E8E9A" }}>Account Info</h4>
        <div style={{ display:"flex", flexDirection:"column", gap:"8px" }}>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:"#8E8E9A", fontSize:"13px" }}>Status</span><Badge status={h?.status} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ color:"#8E8E9A", fontSize:"13px" }}>Registered</span>
            <span style={{ fontSize:"13px" }}>{h?.createdAt ? new Date(h.createdAt).toLocaleDateString() : "—"}</span>
          </div>
          {h?.approvedAt && (
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <span style={{ color:"#8E8E9A", fontSize:"13px" }}>Approved</span>
              <span style={{ fontSize:"13px" }}>{new Date(h.approvedAt).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
