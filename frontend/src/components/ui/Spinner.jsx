export default function Spinner({ size = 24, color = "#E8192C" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" style={{ animation: "spin 0.75s linear infinite", flexShrink: 0 }}>
      <circle cx="12" cy="12" r="9" fill="none" stroke={color} strokeWidth="2.5"
        strokeDasharray="38 18" strokeLinecap="round" />
    </svg>
  );
}
