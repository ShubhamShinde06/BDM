const Card = ({ children, style = {}, className = "" }) => (
  <div className={className} style={{
    background: COLORS.card, border: `1px solid ${COLORS.cardBorder}`,
    borderRadius: "16px", padding: "24px", ...style,
  }}>{children}</div>
);