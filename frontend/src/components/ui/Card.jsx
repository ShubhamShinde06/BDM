export default function Card({ children, style = {}, className = "", onClick }) {
  return (
    <div
      className={className}
      onClick={onClick}
      style={{
        background: "#18181C",
        border: "1px solid #2A2A30",
        borderRadius: "16px",
        padding: "24px",
        ...(onClick && { cursor: "pointer" }),
        ...style,
      }}
    >
      {children}
    </div>
  );
}
