import { useState } from "react";
import toast from "react-hot-toast";
import { useGetInventoryQuery, useUpdateInventoryMutation } from "../../features/hospital/hospitalApi";
import Card from "../../components/ui/Card";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { BloodBadge } from "../../components/ui/Badge";

export default function HospitalInventory() {
  const { data, isLoading } = useGetInventoryQuery();
  const [updateInventory, { isLoading: updating }] = useUpdateInventoryMutation();
  const [editing, setEditing] = useState(null); // { bloodGroup, units }
  const [editVal, setEditVal] = useState("");

  const inventory = data?.data || [];

  const startEdit = (item) => { setEditing(item.bloodGroup); setEditVal(String(item.units)); };
  const cancelEdit = () => { setEditing(null); setEditVal(""); };

  const saveEdit = async (bloodGroup) => {
    const units = parseInt(editVal);
    if (isNaN(units) || units < 0) { toast.error("Enter a valid number"); return; }
    try {
      await updateInventory({ bloodGroup, units }).unwrap();
      toast.success(`${bloodGroup} updated to ${units} units`);
      cancelEdit();
    } catch (e) { toast.error(e?.data?.message || "Update failed"); }
  };

  if (isLoading) return <div style={{ display:"flex", justifyContent:"center", padding:"60px" }}><Spinner /></div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"16px" }}>
        {inventory.map((item) => {
          const pct = Math.min((item.units / 50) * 100, 100);
          const color = item.units < 5 ? "#E8192C" : item.units < 15 ? "#F59E0B" : "#22C55E";
          const isEdit = editing === item.bloodGroup;
          return (
            <Card key={item.bloodGroup} style={{ padding:"20px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"14px" }}>
                <BloodBadge group={item.bloodGroup} />
                <span style={{ fontFamily:"'Syne',sans-serif", fontSize:"28px", fontWeight:800, color }}>{item.units}</span>
              </div>
              <div style={{ height:"6px", background:"#2A2A30", borderRadius:"999px", overflow:"hidden", marginBottom:"12px" }}>
                <div style={{ height:"100%", width:`${pct}%`, background:color, borderRadius:"999px", transition:"width 0.5s ease" }} />
              </div>
              <p style={{ fontSize:"11px", color:"#8E8E9A", marginBottom:"12px" }}>
                Last updated: {new Date(item.lastUpdated).toLocaleDateString()}
              </p>

              {isEdit ? (
                <div style={{ display:"flex", gap:"8px" }}>
                  <input
                    type="number" min="0" value={editVal}
                    onChange={(e) => setEditVal(e.target.value)}
                    style={{ flex:1, padding:"8px 12px", background:"#1F1F24", border:"1px solid #E8192C", borderRadius:"8px", color:"#F5F5F7", fontSize:"14px", fontFamily:"'DM Sans',sans-serif", outline:"none" }}
                  />
                  <Button size="sm" variant="success" loading={updating} onClick={() => saveEdit(item.bloodGroup)}>✓</Button>
                  <Button size="sm" variant="ghost" onClick={cancelEdit}>✕</Button>
                </div>
              ) : (
                <Button size="sm" variant="secondary" full onClick={() => startEdit(item)}>
                  ✏️ Update Stock
                </Button>
              )}

              {item.units < 5 && (
                <div style={{ marginTop:"10px", padding:"6px 10px", background:"rgba(232,25,44,0.08)", borderRadius:"7px" }}>
                  <p style={{ fontSize:"11px", color:"#FF4D5E", fontWeight:700 }}>⚠️ CRITICAL LOW</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
