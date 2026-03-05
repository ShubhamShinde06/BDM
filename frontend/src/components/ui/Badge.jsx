const Badge = ({ status }) => {
  const map = {
    approved: ["badge-success", "Approved"],
    pending: ["badge-warning", "Pending"],
    rejected: ["badge-danger", "Rejected"],
    active: ["badge-success", "Active"],
    blocked: ["badge-danger", "Blocked"],
    accepted: ["badge-success", "Accepted"],
    critical: ["badge-danger", "Critical"],
    high: ["badge-warning", "High"],
    medium: ["badge-info", "Medium"],
    donor: ["badge-info", "Donor"],
    receiver: ["badge-neutral", "Receiver"],
    available: ["badge-success", "Available"],
    unavailable: ["badge-neutral", "Unavailable"],
  };
  const [cls, label] = map[status] || ["badge-neutral", status];
  return <span className={`badge ${cls}`}>{label}</span>;
};