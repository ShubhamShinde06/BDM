import { useGetDonationHistoryQuery } from "../../features/user/userApi";
import { Table, Td, EmptyRow } from "../../components/ui/Table";
import { BloodBadge } from "../../components/ui/Badge";
import Card from "../../components/ui/Card";

export default function DonationHistory() {
  const { data, isLoading } = useGetDonationHistoryQuery({ limit:20 });
  const history = data?.data || [];

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <Card style={{ padding:0 }}>
        <div style={{ padding:"18px 22px", borderBottom:"1px solid #2A2A30", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <h3 style={{ fontFamily:"'Syne',sans-serif", fontSize:"16px", fontWeight:700 }}>Donation History ({data?.total || 0})</h3>
          <span style={{ fontSize:"13px", color:"#22C55E", fontWeight:600 }}>🏆 {data?.total || 0} life-saving donations</span>
        </div>
        <Table columns={["Hospital","Blood Group","Units","Date","Certificate"]} loading={isLoading}>
          {history.length===0 && !isLoading
            ? <EmptyRow cols={5} message="No donations recorded yet" icon="💉" />
            : history.map((d) => (
              <tr key={d._id}>
                <Td>
                  <p style={{ fontWeight:600 }}>{d.hospital?.name||"—"}</p>
                  <p style={{ fontSize:"12px", color:"#8E8E9A" }}>{d.hospital?.location?.city}</p>
                </Td>
                <Td><BloodBadge group={d.bloodGroup} /></Td>
                <Td style={{ fontWeight:700, color:"#22C55E" }}>+{d.units}</Td>
                <Td style={{ color:"#8E8E9A", fontSize:"13px" }}>{new Date(d.donatedAt).toLocaleDateString()}</Td>
                <Td>
                  <code style={{ fontSize:"11px", background:"#1F1F24", padding:"3px 8px", borderRadius:"6px", color:"#3B82F6" }}>
                    {d.certificateId}
                  </code>
                </Td>
              </tr>
            ))
          }
        </Table>
      </Card>
    </div>
  );
}
