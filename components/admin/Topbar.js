"use client";
export default function Topbar({ title, subtitle }) {
  return (
    <header style={{
      height: 56, borderBottom: "1px solid #bbf7d0",
      display: "flex", alignItems: "center",
      padding: "0 24px", gap: 12,
      background: "#fff", position: "sticky", top: 0, zIndex: 10,
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 15, fontWeight: 700, color: "#14532d" }}>{title}</div>
        {subtitle && <div style={{ fontSize: 11, color: "#6b7280" }}>{subtitle}</div>}
      </div>
      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <div style={{ position: "relative" }}>
          <button style={{
            background: "#f0fdf4", border: "1px solid #bbf7d0",
            borderRadius: 8, padding: "6px 12px", cursor: "pointer", fontSize: 14,
          }}>🔔</button>
          <span style={{
            position: "absolute", top: 2, right: 2, width: 7, height: 7,
            borderRadius: "50%", background: "#ef4444",
          }}/>
        </div>
        <button style={{
          background: "#16a34a", color: "#fff", border: "none",
          borderRadius: 8, padding: "7px 16px", fontWeight: 600,
          fontSize: 12, cursor: "pointer",
        }}>+ New Match</button>
      </div>
    </header>
  );
}