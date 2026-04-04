"use client";
import { useState } from "react";
import Topbar from "@/components/admin/Topbar";
import StatusBadge from "@/components/admin/StatusBadge";
import { OFFERS } from "@/lib/adminData";

export default function OffersPage() {
  const [data, setData] = useState(OFFERS);

  const approve = (id) => setData(prev => prev.map(o => o.id === id ? { ...o, status: "open" } : o));
  const close   = (id) => setData(prev => prev.map(o => o.id === id ? { ...o, status: "closed" } : o));

  const TH = { padding: "10px 14px", fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #bbf7d0", textAlign: "left", background: "#f0fdf4" };
  const TD = { padding: "12px 14px", fontSize: 12, color: "#1f2937", borderBottom: "1px solid #f0fdf4", verticalAlign: "middle" };

  return (
    <>
      <Topbar title="Offers" subtitle="Review and manage shop campaign offers" />
      <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>

        {/* Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Total Offers", val: data.length,                            icon: "💰", color: "#16a34a" },
            { label: "Open",         val: data.filter(o=>o.status==="open").length,  icon: "✅", color: "#16a34a" },
            { label: "Under Review", val: data.filter(o=>o.status==="review").length, icon: "🔍", color: "#f59e0b" },
          ].map(c => (
            <div key={c.label} style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 12, padding: "16px 20px", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ fontSize: 28 }}>{c.icon}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>{c.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: c.color }}>{c.val}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0fdf4", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontWeight: 600, fontSize: 13, color: "#14532d" }}>All Offers</span>
            <button style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "6px 14px", fontWeight: 600, fontSize: 11, cursor: "pointer" }}>
              + Create Offer
            </button>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Shop","Campaign Title","Niche","Budget","Applicants","Status","Deadline","Actions"].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map(o => (
                <tr key={o.id}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ ...TD, fontWeight: 600, color: "#14532d" }}>{o.shop}</td>
                  <td style={TD}>{o.title}</td>
                  <td style={TD}>
                    <span style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{o.niche}</span>
                  </td>
                  <td style={{ ...TD, fontWeight: 700, color: "#14532d" }}>{o.budget}</td>
                  <td style={TD}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <span style={{ fontSize: 14 }}>👤</span>
                      <span style={{ fontWeight: 600 }}>{o.applicants}</span>
                    </div>
                  </td>
                  <td style={TD}><StatusBadge status={o.status} /></td>
                  <td style={{ ...TD, color: "#6b7280" }}>{o.deadline}</td>
                  <td style={TD}>
                    <div style={{ display: "flex", gap: 5 }}>
                      {o.status === "review" && (
                        <button onClick={() => approve(o.id)} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 10, cursor: "pointer", fontWeight: 600 }}>
                          Approve
                        </button>
                      )}
                      {o.status === "open" && (
                        <button onClick={() => close(o.id)} style={{ background: "#fee2e2", color: "#dc2626", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 10, cursor: "pointer", fontWeight: 600 }}>
                          Close
                        </button>
                      )}
                      <button style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 8px", fontSize: 10, cursor: "pointer", color: "#6b7280" }}>
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