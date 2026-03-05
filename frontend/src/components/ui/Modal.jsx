const Modal = ({ title, children, onClose }) => (
  <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
    <Card style={{ width: "100%", maxWidth: "500px", maxHeight: "90vh", overflow: "auto", margin: "20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <h3 style={{ fontFamily: "'Syne', sans-serif", fontSize: "18px", fontWeight: 700 }}>{title}</h3>
        <button onClick={onClose} style={{ background: "none", border: "none", color: COLORS.textMuted, fontSize: "20px", cursor: "pointer", padding: "4px" }}>✕</button>
      </div>
      {children}
    </Card>
  </div>
);