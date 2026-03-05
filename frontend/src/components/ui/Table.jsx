import Spinner from "./Spinner";

export function Table({ columns, children, loading }) {
  return (
    <div style={{ overflowX: "auto" }}>
      {loading ? (
        <div style={{ padding: "48px", display: "flex", justifyContent: "center" }}>
          <Spinner />
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col} style={{ fontFamily: "'Syne',sans-serif", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#8E8E9A", padding: "10px 16px", textAlign: "left", borderBottom: "1px solid #2A2A30", whiteSpace: "nowrap" }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{children}</tbody>
        </table>
      )}
    </div>
  );
}

export function Td({ children, style = {} }) {
  return (
    <td style={{ padding: "13px 16px", borderBottom: "1px solid rgba(42,42,48,0.5)", fontSize: "14px", color: "#F5F5F7", verticalAlign: "middle", ...style }}>
      {children}
    </td>
  );
}

export function EmptyRow({ cols, message = "No data found", icon = "📭" }) {
  return (
    <tr>
      <td colSpan={cols} style={{ padding: "48px", textAlign: "center", color: "#8E8E9A" }}>
        <div style={{ fontSize: "36px", marginBottom: "10px" }}>{icon}</div>
        {message}
      </td>
    </tr>
  );
}
