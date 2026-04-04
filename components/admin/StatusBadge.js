const COLORS = {
  active:    { bg: "#dcfce7", text: "#16a34a" },
  pending:   { bg: "#fef9c3", text: "#ca8a04" },
  completed: { bg: "#dbeafe", text: "#2563eb" },
  banned:    { bg: "#fee2e2", text: "#dc2626" },
  open:      { bg: "#dcfce7", text: "#16a34a" },
  review:    { bg: "#fef9c3", text: "#ca8a04" },
  Pro:       { bg: "#f3e8ff", text: "#7c3aed" },
  Basic:     { bg: "#f0fdf4", text: "#6b7280" },
};

export default function StatusBadge({ status }) {
  const c = COLORS[status] || { bg: "#f3f4f6", text: "#6b7280" };
  return (
    <span style={{
      background: c.bg, color: c.text,
      borderRadius: 20, fontSize: 11, fontWeight: 600,
      padding: "3px 10px", display: "inline-block",
    }}>{status}</span>
  );
}