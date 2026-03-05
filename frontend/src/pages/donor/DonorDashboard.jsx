import toast from "react-hot-toast";
import { useGetUserStatsQuery, useGetUserProfileQuery, useToggleAvailabilityMutation } from "../../features/user/userApi";
import StatCard from "../../components/ui/StatCard";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Badge, { BloodBadge } from "../../components/ui/Badge";
import Spinner from "../../components/ui/Spinner";

export default function DonorDashboard() {
  const { data: profileData, isLoading: pLoading } = useGetUserProfileQuery();
  const { data: statsData,   isLoading: sLoading }  = useGetUserStatsQuery();
  const [toggleAvail, { isLoading: toggling }] = useToggleAvailabilityMutation();

  const user  = profileData?.data;
  const stats = statsData?.data || {};

  if (pLoading || sLoading) return <div style={{ display:"flex", justifyContent:"center", padding:"60px" }}><Spinner /></div>;

  const handleToggle = async () => {
    try {
      const res = await toggleAvail({ available: !user.availability }).unwrap();
      toast.success(res.message || "Availability updated");
    } catch (e) { toast.error(e?.data?.message || "Failed"); }
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"22px" }}>
      {/* Status hero */}
      <Card style={{ background:"linear-gradient(135deg,rgba(232,25,44,0.1),rgba(24,24,28,0.95))", border:"1px solid rgba(232,25,44,0.25)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"16px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:"16px" }}>
            <div style={{ width:"58px", height:"58px", borderRadius:"15px", background:"rgba(232,25,44,0.15)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"26px" }}>🩸</div>
            <div>
              <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"20px", fontWeight:700 }}>{user?.name}</h3>
              <div style={{ display:"flex", gap:"8px", marginTop:"6px", flexWrap:"wrap", alignItems:"center" }}>
                <BloodBadge group={user?.bloodGroup} />
                <Badge status="donor" />
                <Badge status={user?.availability ? "available" : "unavailable"} />
              </div>
            </div>
          </div>
          <Button
            variant={user?.availability ? "danger" : "success"}
            loading={toggling}
            onClick={handleToggle}
          >
            {user?.availability ? "🔴 Set Unavailable" : "🟢 Set Available"}
          </Button>
        </div>
      </Card>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(170px,1fr))", gap:"14px" }}>
        <StatCard icon="💉" label="Total Donations" value={stats.totalDonations}       color="#22C55E" />
        <StatCard icon="❤️"  label="Lives Saved"     value={stats.totalDonations}       color="#E8192C" sub="Estimated" />
        <StatCard icon="✅" label="Eligible"          value={stats.isEligible?"Yes":"No"} color={stats.isEligible?"#22C55E":"#F59E0B"} />
        <StatCard icon="📅" label="Last Donation"    value={stats.lastDonation ? new Date(stats.lastDonation).toLocaleDateString("en",{month:"short",day:"numeric"}) : "—"} color="#3B82F6" />
      </div>

      {!stats.isEligible && stats.nextEligibleDate && (
        <div style={{ background:"rgba(245,158,11,0.07)", border:"1px solid rgba(245,158,11,0.2)", borderRadius:"14px", padding:"16px 20px" }}>
          <p style={{ color:"#F59E0B", fontWeight:700 }}>⏳ Donation Cooldown Active</p>
          <p style={{ color:"#8E8E9A", fontSize:"13px", marginTop:"4px" }}>
            You can donate again on {new Date(stats.nextEligibleDate).toLocaleDateString()}.
          </p>
        </div>
      )}

      <Card>
        <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700, marginBottom:"12px" }}>Quick Tips</h3>
        {[
          "🩸 Donate blood every 56 days (8 weeks).",
          "💧 Drink plenty of water before and after donation.",
          "🍎 Eat a healthy meal before donating.",
          "😴 Get a good night's sleep before donation day.",
        ].map((tip, i) => (
          <p key={i} style={{ fontSize:"13px", color:"#8E8E9A", padding:"8px 0", borderBottom: i < 3 ? "1px solid rgba(42,42,48,0.4)" : "none" }}>{tip}</p>
        ))}
      </Card>
    </div>
  );
}
