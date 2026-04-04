"use client";
import { useState } from "react";
import Topbar from "../../../components/admin/Topbar";
import StatusBadge from "../../../components/admin/StatusBadge";
import { MATCHES } from "../../../lib/adminData";

const TABS = ["all", "active", "pending", "completed"];

export default function MatchesPage() {
  const [tab, setTab]       = useState("all");
  const [search, setSearch] = useState("");
  const [data, setData]     = useState(MATCHES);

  const visible = data.filter(m =>
    (tab === "all" || m.status === tab) &&
    (m.influencer.toLowerCase().includes(search.toLowerCase()) ||
     m.shop.toLowerCase().includes(search.toLowerCase()))
  );

  const approve = (id) => setData(prev => prev.map(m => m.id === id ? { ...m, status: "active" } : m));
  const complete = (id) => setData(prev => prev.map(m => m.id === id ? { ...m, status: "completed" } : m));

  const TH = { padding: "10px 14px", fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #bbf7d0", textAlign: "left", background: "#f0fdf4" };
  const TD = { padding: "11px 14px", fontSize: 12, color: "#1f2937", borderBottom: "1px solid #f0fdf4", verticalAlign: "middle" };

  const count = (s) => s === "all" ? data.length : data.filter(m => m.status === s).length;

  return (
    <>
      <Topbar title="Matches" subtitle="Manage influencer ↔ shop matches" />
      <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>

        {/* Tabs */}
        <div style={{ display: "flex", gap: 4, background: "#dcfce7", borderRadius: 10, padding: 4, marginBottom: 16, width: "fit-content" }}>
          {TABS.map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              padding: "6px 16px", borderRadius: 7, border: "none",
              background: tab === t ? "#16a34a" : "transparent",
              color: tab === t ? "#fff" : "#374151",
              fontWeight: 600, fontSize: 12, cursor: "pointer", textTransform: "capitalize",
            }}>
              {t.charAt(0).toUpperCase() + t.slice(1)} ({count(t)})
            </button>
          ))}
        </div>

        <div style={{ display: "flex", gap: 8, marginBottom: 14, alignItems: "center" }}>
          <input
            placeholder="Search influencer or shop…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 8, padding: "7px 12px", fontSize: 12, color: "#1f2937", width: 240 }}
          />
          <button style={{ marginLeft: "auto", background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
            + Create Match
          </button>
        </div>

        <div style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Match ID","Influencer","Shop","Category","Offer","Status","Date","Actions"].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(m => (
                <tr key={m.id}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ ...TD, fontFamily: "monospace", fontSize: 11, color: "#9ca3af" }}>{m.id}</td>
                  <td style={TD}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: "50%", background: "#dcfce7", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 700, color: "#16a34a" }}>
                        {m.influencer.slice(0,2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: "#14532d" }}>{m.influencer}</span>
                    </div>
                  </td>
                  <td style={TD}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 24, height: 24, borderRadius: 6, background: "#f0fdf4", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 9, fontWeight: 800, color: "#16a34a" }}>
                        {m.shop[0]}
                      </div>
                      {m.shop}
                    </div>
                  </td>
                  <td style={TD}>
                    <span style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{m.category}</span>
                  </td>
                  <td style={{ ...TD, fontWeight: 700, color: "#14532d" }}>{m.offer}</td>
                  <td style={TD}><StatusBadge status={m.status} /></td>
                  <td style={{ ...TD, color: "#6b7280" }}>{m.date}</td>
                  <td style={TD}>
                    <div style={{ display: "flex", gap: 5 }}>
                      {m.status === "pending" && (
                        <button onClick={() => approve(m.id)} style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 10, cursor: "pointer", fontWeight: 600 }}>
                          Approve
                        </button>
                      )}
                      {m.status === "active" && (
                        <button onClick={() => complete(m.id)} style={{ background: "#dbeafe", color: "#2563eb", border: "none", borderRadius: 6, padding: "4px 8px", fontSize: 10, cursor: "pointer", fontWeight: 600 }}>
                          Complete
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
          {visible.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🤝</div>
              <div>No matches found</div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}