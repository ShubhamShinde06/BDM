import Spinner from "./Spinner";

export default function PageLoader() {
  return (
    <div style={{ position: "fixed", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "#111114", zIndex: 9999, gap: "20px" }}>
      <span className="heartbeat" style={{ fontSize: "52px" }}>🩸</span>
      <Spinner size={32} />
    </div>
  );
}
