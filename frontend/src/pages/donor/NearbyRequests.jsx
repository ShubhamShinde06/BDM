import { useState } from "react";
import { useGetNearbyRequestsQuery } from "../../features/user/userApi";
import Card from "../../components/ui/Card";
import Badge, { BloodBadge } from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";

export default function NearbyRequests() {
  const [city, setCity] = useState("");
  const [search, setSearch] = useState("");
  const { data, isLoading, refetch } = useGetNearbyRequestsQuery({ city: search, limit:20 });
  const requests = data?.data || [];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <div style={{ display:"flex", gap:"10px" }}>
        <input
          value={city} onChange={(e) => setCity(e.target.value)}
          placeholder="Filter by city..."
          style={{ flex:1, padding:"10px 14px", background:"#1F1F24", border:"1px solid #2A2A30", borderRadius:"10px", color:"#F5F5F7", fontSize:"14px", fontFamily:"'DM Sans',sans-serif", outline:"none" }}
        />
        <Button onClick={() => setSearch(city)}>Search</Button>
        {search && <Button variant="ghost" onClick={() => { setCity(""); setSearch(""); }}>Clear</Button>}
      </div>

      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <p style={{ color:"#8E8E9A", fontSize:"13px" }}>
          {isLoading ? "Loading..." : `${requests.length} request(s) match your blood group`}
        </p>
        <Button size="sm" variant="ghost" onClick={refetch}>🔄 Refresh</Button>
      </div>

      {isLoading
        ? <div style={{ display:"flex", justifyContent:"center", padding:"60px" }}><Spinner /></div>
        : requests.length === 0
          ? (
            <Card style={{ textAlign:"center", padding:"48px" }}>
              <div style={{ fontSize:"48px", marginBottom:"12px" }}>✅</div>
              <p style={{ color:"#8E8E9A" }}>No pending requests matching your blood group right now.</p>
              <p style={{ color:"#8E8E9A", fontSize:"13px", marginTop:"6px" }}>Keep availability on to get notified!</p>
            </Card>
          )
          : requests.map((r) => (
            <Card key={r._id}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"14px" }}>
                <div style={{ display:"flex", gap:"14px", alignItems:"flex-start" }}>
                  <BloodBadge group={r.bloodGroup} />
                  <div>
                    <p style={{ fontWeight:700, fontSize:"16px" }}>
                      {r.requester?.name || "Patient"} <span style={{ color:"#8E8E9A", fontWeight:400, fontSize:"14px" }}>needs blood</span>
                    </p>
                    <p style={{ fontSize:"13px", color:"#8E8E9A", marginTop:"3px" }}>
                      🏥 {r.hospital?.name} • 📍 {r.hospital?.location?.city}
                    </p>
                    <p style={{ fontSize:"12px", color:"#8E8E9A", marginTop:"3px" }}>
                      {r.units} unit(s) • {new Date(r.createdAt).toLocaleDateString()}
                    </p>
                    {r.reason && <p style={{ fontSize:"12px", color:"#8E8E9A", marginTop:"4px", fontStyle:"italic" }}>"{r.reason}"</p>}
                  </div>
                </div>
                <div style={{ display:"flex", gap:"8px", alignItems:"center", flexWrap:"wrap" }}>
                  <Badge status={r.urgency} />
                  <a href={`tel:${r.hospital?.contact?.phone}`}>
                    <Button size="sm" variant="primary">📞 Contact Hospital</Button>
                  </a>
                </div>
              </div>
            </Card>
          ))
      }
    </div>
  );
}
