"use client";
import { useState } from "react";
import Topbar from "@/components/admin/Topbar";
import StatusBadge from "@/components/admin/StatusBadge";
import { SHOPS } from "@/lib/adminData";

export default function ShopsPage() {
  const [search, setSearch] = useState("");
  const [data, setData]     = useState(SHOPS);

  const visible = data.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.category.toLowerCase().includes(search.toLowerCase()) ||
    s.city.toLowerCase().includes(search.toLowerCase())
  );

  const approve = (id) => {
    setData(prev => prev.map(s => s.id === id ? { ...s, status: "active" } : s));
  };

  const TH = { padding: "10px 14px", fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #bbf7d0", textAlign: "left", background: "#f0fdf4" };
  const TD = { padding: "12px 14px", fontSize: 12, color: "#1f2937", borderBottom: "1px solid #f0fdf4", verticalAlign: "middle" };

  const pending = data.filter(s => s.status === "pending").length;

  return (
    <>
      <Topbar title="Shops" subtitle={`${data.length} shops · ${pending} pending approval`} />
      <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>

        {/* Mini stat strip */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 10, marginBottom: 18 }}>
          {[
            { label: "Total Shops",    val: data.length,                           color: "#16a34a" },
            { label: "Active",         val: data.filter(s=>s.status==="active").length,  color: "#16a34a" },
            { label: "Pending",        val: pending,                               color: "#f59e0b" },
            { label: "Pro Plan",       val: data.filter(s=>s.plan==="Pro").length, color: "#7c3aed" },
          ].map(s => (
            <div key={s.label} style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 10, padding: "12px 16px" }}>
              <div style={{ fontSize: 10, color: "#6b7280", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>

        {/* Controls */}
        <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
          <input
            placeholder="Search shops, category, city…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 8, padding: "7px 12px", fontSize: 12, color: "#1f2937", width: 240 }}
          />
          <button style={{ marginLeft: "auto", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
            + Add Shop
          </button>
        </div>

        <div style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Shop","Category","City","Plan","Active Offers","Status","Joined","Actions"].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(s => (
                <tr key={s.id}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={TD}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: 8,
                        background: "linear-gradient(135deg,#4ade80,#16a34a)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 800, fontSize: 12, color: "#fff", flexShrink: 0,
                      }}>{s.name[0]}</div>
                      <span style={{ fontWeight: 600, color: "#14532d" }}>{s.name}</span>
                    </div>
                  </td>
                  <td style={TD}>
                    <span style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{s.category}</span>
                  </td>
                  <td style={{ ...TD, color: "#6b7280" }}>{s.city}</td>
                  <td style={TD}><StatusBadge status={s.plan} /></td>
                  <td style={{ ...TD, fontWeight: 700, color: "#14532d" }}>{s.offers}</td>
                  <td style={TD}><StatusBadge status={s.status} /></td>
                  <td style={{ ...TD, color: "#6b7280" }}>{s.joined}</td>
                  <td style={TD}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {s.status === "pending" && (
                        <button onClick={() => approve(s.id)} style={{
                          background: "#16a34a", color: "#fff", border: "none",
                          borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", fontWeight: 600,
                        }}>Approve</button>
                      )}
                      <button style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", color: "#6b7280" }}>
                        View
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}