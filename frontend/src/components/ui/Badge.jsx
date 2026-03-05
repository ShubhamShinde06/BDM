const MAP = {
  approved:   ["rgba(34,197,94,0.13)",  "#22C55E"],
  active:     ["rgba(34,197,94,0.13)",  "#22C55E"],
  accepted:   ["rgba(34,197,94,0.13)",  "#22C55E"],
  completed:  ["rgba(59,130,246,0.13)", "#3B82F6"],
  available:  ["rgba(34,197,94,0.13)",  "#22C55E"],
  online:     ["rgba(34,197,94,0.13)",  "#22C55E"],
  donor:      ["rgba(59,130,246,0.13)", "#3B82F6"],
  pending:    ["rgba(245,158,11,0.13)", "#F59E0B"],
  high:       ["rgba(245,158,11,0.13)", "#F59E0B"],
  warning:    ["rgba(245,158,11,0.13)", "#F59E0B"],
  rejected:   ["rgba(232,25,44,0.13)",  "#FF4D5E"],
  blocked:    ["rgba(232,25,44,0.13)",  "#FF4D5E"],
  suspended:  ["rgba(232,25,44,0.13)",  "#FF4D5E"],
  critical:   ["rgba(232,25,44,0.13)",  "#FF4D5E"],
  cancelled:  ["rgba(142,142,154,0.13)","#8E8E9A"],
  medium:     ["rgba(59,130,246,0.13)", "#3B82F6"],
  low:        ["rgba(142,142,154,0.13)","#8E8E9A"],
  receiver:   ["rgba(142,142,154,0.13)","#8E8E9A"],
  unavailable:["rgba(142,142,154,0.13)","#8E8E9A"],
  offline:    ["rgba(142,142,154,0.13)","#8E8E9A"],
  info:       ["rgba(59,130,246,0.13)", "#3B82F6"],
};

export default function Badge({ status, label }) {
  const [bg, color] = MAP[status] || ["rgba(142,142,154,0.13)", "#8E8E9A"];
  const text = label ?? (status ? status.charAt(0).toUpperCase() + status.slice(1) : "—");
  return (
    <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: "999px", fontSize: "11px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase", background: bg, color, whiteSpace: "nowrap" }}>
      {text}
    </span>
  );
}

export function BloodBadge({ group }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minWidth: "42px", height: "36px", padding: "0 8px", borderRadius: "9px", background: "rgba(232,25,44,0.12)", color: "#FF4D5E", fontFamily: "'Syne',sans-serif", fontWeight: 800, fontSize: "13px", border: "1px solid rgba(232,25,44,0.22)" }}>
      {group}
    </span>
  );
}
