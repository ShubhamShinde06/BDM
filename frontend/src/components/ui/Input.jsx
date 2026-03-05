export default function Input({
  label, type = "text", value, onChange, placeholder,
  required, options, icon, error, name, readOnly, rows,
}) {
  const base = {
    width: "100%", background: readOnly ? "#18181C" : "#1F1F24",
    border: `1px solid ${error ? "#E8192C" : "#2A2A30"}`,
    borderRadius: "10px", color: "#F5F5F7", fontSize: "14px",
    fontFamily: "'DM Sans',sans-serif", outline: "none",
    padding: `11px 14px 11px ${icon ? "38px" : "14px"}`,
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
      {label && (
        <label style={{ fontSize: "11px", fontWeight: 700, color: "#8E8E9A", letterSpacing: "0.08em", textTransform: "uppercase", fontFamily: "'Syne',sans-serif" }}>
          {label}
        </label>
      )}
      <div style={{ position: "relative" }}>
        {icon && (
          <span style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", fontSize: "15px", color: "#4A4A55", pointerEvents: "none", zIndex: 1 }}>
            {icon}
          </span>
        )}
        {type === "select" ? (
          <select name={name} value={value} onChange={onChange} required={required} style={{ ...base, appearance: "none" }}>
            {options?.map((o) => (
              <option key={o.value} value={o.value} style={{ background: "#1F1F24" }}>{o.label}</option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea name={name} value={value} onChange={onChange} placeholder={placeholder} required={required} rows={rows || 3}
            style={{ ...base, padding: "11px 14px", resize: "vertical" }} />
        ) : (
          <input type={type} name={name} value={value} onChange={onChange} placeholder={placeholder}
            required={required} readOnly={readOnly} style={base} />
        )}
      </div>
      {error && <p style={{ fontSize: "11px", color: "#E8192C" }}>{error}</p>}
    </div>
  );
}
