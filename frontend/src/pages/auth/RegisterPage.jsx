import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useRegisterUserMutation, useRegisterHospitalMutation } from "../../features/auth/authApi";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import Card from "../../components/ui/Card";

const BG = ["A+","A-","B+","B-","O+","O-","AB+","AB-"];

export default function RegisterPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState("user"); // "user" | "hospital"
  const [registerUser, { isLoading: uLoading }] = useRegisterUserMutation();
  const [registerHospital, { isLoading: hLoading }] = useRegisterHospitalMutation();

  const [uForm, setUForm] = useState({ name:"", email:"", password:"", role:"donor", bloodGroup:"O+", phone:"", "location.city":"" });
  const [hForm, setHForm] = useState({ name:"", email:"", password:"", licenseNumber:"", "contact.phone":"", "location.city":"", "location.address":"" });

  const handleUser = async (e) => {
    e.preventDefault();
    try {
      await registerUser({
        name: uForm.name, email: uForm.email, password: uForm.password,
        role: uForm.role, bloodGroup: uForm.bloodGroup, phone: uForm.phone,
        location: { city: uForm["location.city"] },
      }).unwrap();
      toast.success("Account created! Please login.");
      navigate("/login");
    } catch (err) { toast.error(err?.data?.message || "Registration failed"); }
  };

  const handleHospital = async (e) => {
    e.preventDefault();
    try {
      await registerHospital({
        name: hForm.name, email: hForm.email, password: hForm.password,
        licenseNumber: hForm.licenseNumber,
        contact: { phone: hForm["contact.phone"] },
        location: { city: hForm["location.city"], address: hForm["location.address"] },
      }).unwrap();
      toast.success("Hospital submitted! Awaiting admin approval.");
      navigate("/login");
    } catch (err) { toast.error(err?.data?.message || "Registration failed"); }
  };

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#111114", padding: "20px" }}>
      <div style={{ width: "100%", maxWidth: "460px" }} className="fade-up">
        <div style={{ textAlign: "center", marginBottom: "28px" }}>
          <span className="heartbeat" style={{ fontSize: "44px", display: "block", marginBottom: "10px" }}>🩸</span>
          <h1 style={{ fontFamily: "'Syne',sans-serif", fontSize: "26px", fontWeight: 800, color: "#F5F5F7" }}>Create Account</h1>
        </div>

        {/* Tab toggle */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          {[{ id:"user", label:"👤 User / Donor" }, { id:"hospital", label:"🏥 Hospital" }].map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)} style={{ flex: 1, padding: "11px", borderRadius: "10px", border: `1px solid ${tab===t.id?"#E8192C":"#2A2A30"}`, background: tab===t.id?"rgba(232,25,44,0.1)":"#1F1F24", color: tab===t.id?"#FF4D5E":"#8E8E9A", fontFamily:"'DM Sans',sans-serif", fontWeight:600, fontSize:"13px", cursor:"pointer" }}>
              {t.label}
            </button>
          ))}
        </div>

        <Card>
          {tab === "user" ? (
            <form onSubmit={handleUser} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              <Input label="Full Name" value={uForm.name} onChange={(e)=>setUForm({...uForm,name:e.target.value})} placeholder="Ali Hassan" icon="👤" required />
              <Input label="Email" type="email" value={uForm.email} onChange={(e)=>setUForm({...uForm,email:e.target.value})} placeholder="ali@example.com" icon="✉" required />
              <Input label="Password" type="password" value={uForm.password} onChange={(e)=>setUForm({...uForm,password:e.target.value})} placeholder="Min 6 characters" icon="🔒" required />
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <Input label="I am a" type="select" value={uForm.role} onChange={(e)=>setUForm({...uForm,role:e.target.value})} options={[{value:"donor",label:"🩸 Donor"},{value:"receiver",label:"🆘 Receiver"}]} />
                <Input label="Blood Group" type="select" value={uForm.bloodGroup} onChange={(e)=>setUForm({...uForm,bloodGroup:e.target.value})} options={BG.map((g)=>({value:g,label:g}))} />
              </div>
              <Input label="Phone" value={uForm.phone} onChange={(e)=>setUForm({...uForm,phone:e.target.value})} placeholder="+92 300 0000000" icon="📞" />
              <Input label="City" value={uForm["location.city"]} onChange={(e)=>setUForm({...uForm,"location.city":e.target.value})} placeholder="Karachi" icon="📍" />
              <Button type="submit" full loading={uLoading} style={{marginTop:"4px"}}>Create Account</Button>
            </form>
          ) : (
            <form onSubmit={handleHospital} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              <Input label="Hospital Name" value={hForm.name} onChange={(e)=>setHForm({...hForm,name:e.target.value})} placeholder="City General Hospital" icon="🏥" required />
              <Input label="Email" type="email" value={hForm.email} onChange={(e)=>setHForm({...hForm,email:e.target.value})} placeholder="hospital@example.com" icon="✉" required />
              <Input label="Password" type="password" value={hForm.password} onChange={(e)=>setHForm({...hForm,password:e.target.value})} placeholder="Min 6 characters" icon="🔒" required />
              <Input label="License Number" value={hForm.licenseNumber} onChange={(e)=>setHForm({...hForm,licenseNumber:e.target.value})} placeholder="LIC-2041" icon="📋" required />
              <Input label="Phone" value={hForm["contact.phone"]} onChange={(e)=>setHForm({...hForm,"contact.phone":e.target.value})} placeholder="+92 21 0000000" icon="📞" />
              <Input label="City" value={hForm["location.city"]} onChange={(e)=>setHForm({...hForm,"location.city":e.target.value})} placeholder="Karachi" icon="📍" />
              <Input label="Address" value={hForm["location.address"]} onChange={(e)=>setHForm({...hForm,"location.address":e.target.value})} placeholder="Street address" icon="🗺" />
              <div style={{ padding:"10px 12px", background:"rgba(245,158,11,0.08)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:"8px" }}>
                <p style={{ fontSize:"12px", color:"#F59E0B" }}>⚠️ Hospital registration requires admin approval before you can login.</p>
              </div>
              <Button type="submit" full loading={hLoading} style={{marginTop:"4px"}}>Submit for Approval</Button>
            </form>
          )}
        </Card>

        <p style={{ textAlign:"center", color:"#8E8E9A", fontSize:"13px", marginTop:"20px" }}>
          Already have an account?{" "}
          <Link to="/login" style={{ color:"#E8192C", fontWeight:600 }}>Login</Link>
        </p>
      </div>
    </div>
  );
}
