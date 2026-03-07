import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useGetUserProfileQuery, useUpdateUserProfileMutation } from "../../features/user/userApi";
import Card from "../../components/ui/Card";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Badge, { BloodBadge } from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

const BG = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];

export default function ProfilePage() {
  const { data, isLoading } = useGetUserProfileQuery();
  const [update, { isLoading: saving }] = useUpdateUserProfileMutation();
  const user = data?.data;

  const [form, setForm] = useState({ name:"", phone:"", "location.city":"" });

  useEffect(() => {
    if (user) setForm({ name: user.name||"", phone: user.phone||"", "location.city": user.location?.city||"" });
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      await update({ name: form.name, phone: form.phone, location: { city: form["location.city"] } }).unwrap();
      toast.success("Profile updated!");
    } catch (e) { toast.error(e?.data?.message || "Update failed"); }
  };

  if (isLoading) return <div style={{ display:"flex", justifyContent:"center", padding:"60px" }}><Spinner /></div>;

  return (
    <div style={{ display: "flex", justifyContent: "center", width: "100%" }}>
      <div style={{ display:"flex", flexDirection:"column", gap:"20px", maxWidth:"580px", width:"100%" }}>
      <Card>
        <div style={{ display:"flex", alignItems:"center", gap:"16px", marginBottom:"22px" }}>
          <div style={{ width:"58px", height:"58px", borderRadius:"15px", background:"rgba(232,25,44,0.12)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Syne',sans-serif", fontSize:"22px", fontWeight:800, color:"#FF4D5E" }}>
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"18px", fontWeight:700 }}>{user?.name}</h3>
            <div style={{ display:"flex", gap:"8px", marginTop:"5px", alignItems:"center" }}>
              <BloodBadge group={user?.bloodGroup} />
              <Badge status={user?.role} />
              <Badge status={user?.status} />
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
          <Input label="Full Name" value={form.name} onChange={(e) => setForm({...form, name:e.target.value})} icon="👤" />
          <Input label="Email" value={user?.email||""} readOnly icon="✉" />
          <Input label="Blood Group" value={user?.bloodGroup||""} readOnly icon="🩸" />
          <Input label="Phone" value={form.phone} onChange={(e) => setForm({...form, phone:e.target.value})} placeholder="+92 300 0000000" icon="📞" />
          <Input label="City" value={form["location.city"]} onChange={(e) => setForm({...form, "location.city":e.target.value})} placeholder="Karachi" icon="📍" />
          <Button type="submit" loading={saving} style={{ alignSelf:"flex-start" }}>Save Changes</Button>
        </form>
      </Card>

      <Card>
        <h4 style={{ fontFamily:"'Syne',sans-serif", fontSize:"14px", fontWeight:700, marginBottom:"12px", color:"#8E8E9A" }}>Account Info</h4>
        <div style={{ display:"flex", flexDirection:"column", gap:"9px" }}>
          {[
            ["Member Since", user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"],
            ["Total Donations", user?.totalDonations || 0],
            ["Last Donation", user?.lastDonation ? new Date(user.lastDonation).toLocaleDateString() : "Never"],
          ].map(([k, v]) => (
            <div key={k} style={{ display:"flex", justifyContent:"space-between", padding:"7px 0", borderBottom:"1px solid rgba(42,42,48,0.4)" }}>
              <span style={{ color:"#8E8E9A", fontSize:"13px" }}>{k}</span>
              <span style={{ fontSize:"13px", fontWeight:600 }}>{v}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
    </div>
    
  );
}
