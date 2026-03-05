export default function Modal({ title, children, onClose, width = "500px" }) {
  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.78)", backdropFilter: "blur(6px)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "fadeIn 0.2s ease" }}
    >
      <div style={{ width: "100%", maxWidth: width, maxHeight: "92vh", overflowY: "auto", background: "#18181C", border: "1px solid #2A2A30", borderRadius: "20px", padding: "28px", animation: "fadeUp 0.25s ease" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px" }}>
          <h3 style={{ fontFamily: "'Syne',sans-serif", fontSize: "18px", fontWeight: 700, color: "#F5F5F7" }}>{title}</h3>
          <button onClick={onClose} style={{ background: "none", border: "none", color: "#8E8E9A", fontSize: "22px", cursor: "pointer", lineHeight: 1, padding: "2px" }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
