const Input = ({ label, type = "text", value, onChange, placeholder, required, options, icon }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
    {label && <label style={{ fontSize: "12px", fontWeight: 600, color: COLORS.textMuted, letterSpacing: "0.05em", textTransform: "uppercase", fontFamily: "'Syne', sans-serif" }}>{label}</label>}
    <div style={{ position: "relative" }}>
      {icon && <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: COLORS.textFaint, fontSize: "16px", pointerEvents: "none" }}>{icon}</span>}
      {type === "select" ? (
        <select value={value} onChange={onChange} required={required} style={{
          width: "100%", padding: `11px ${icon ? "12px 11px 36px" : "14px"}`, background: COLORS.surface,
          border: `1px solid ${COLORS.cardBorder}`, borderRadius: "10px", color: COLORS.text,
          fontSize: "14px", transition: "all 0.2s", appearance: "none",
        }}>
          {options.map(o => <option key={o.value} value={o.value} style={{ background: COLORS.surface }}>{o.label}</option>)}
        </select>
      ) : (
        <input type={type} value={value} onChange={onChange} placeholder={placeholder} required={required} style={{
          width: "100%", padding: `11px ${icon ? "11px 11px 36px" : "14px"}`,
          background: COLORS.surface, border: `1px solid ${COLORS.cardBorder}`,
          borderRadius: "10px", color: COLORS.text, fontSize: "14px", transition: "all 0.2s",
        }} />
      )}
    </div>
  </div>
);