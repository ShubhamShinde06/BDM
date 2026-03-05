import Card from "./Card";

export default function StatCard({ icon, label, value, sub, color = "#E8192C" }) {
  return (
    <Card style={{ padding: "20px 22px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <p style={{ fontSize: "11px", color: "#8E8E9A", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "8px", fontFamily: "'Syne',sans-serif" }}>
            {label}
          </p>
          <p style={{ fontSize: "30px", fontWeight: 800, color: "#F5F5F7", fontFamily: "'Syne',sans-serif", lineHeight: 1 }}>
            {value ?? "—"}
          </p>
          {sub && <p style={{ fontSize: "12px", color: "#8E8E9A", marginTop: "6px" }}>{sub}</p>}
        </div>
        <div style={{ width: "46px", height: "46px", borderRadius: "12px", background: `${color}1A`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", flexShrink: 0 }}>
          {icon}
        </div>
      </div>
    </Card>
  );
}
