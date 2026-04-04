export default function StatCard({ label, value, delta, icon, positive }) {
  const isUp = delta?.startsWith("+") || positive;
  return (
    <div style={{
      background: "#fff", border: "1px solid #bbf7d0",
      borderRadius: 12, padding: "18px 20px",
      boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
    }}>
      <div style={{
        fontSize: 11, fontWeight: 700, color: "#6b7280",
        textTransform: "uppercase", letterSpacing: 0.5,
        display: "flex", justifyContent: "space-between",
        marginBottom: 8,
      }}>
        {label}
        <span style={{ fontSize: 18 }}>{icon}</span>
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color: "#14532d", lineHeight: 1, marginBottom: 6 }}>
        {value}
      </div>
      {delta && (
        <div style={{ fontSize: 12, color: isUp ? "#16a34a" : "#ef4444", display: "flex", alignItems: "center", gap: 3 }}>
          {isUp ? "▲" : "▼"} {delta} vs last month
        </div>
      )}
    </div>
  );
}