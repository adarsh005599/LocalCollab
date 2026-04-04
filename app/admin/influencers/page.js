"use client";
import { useState } from "react";
import Topbar from "../../../components/admin/Topbar";
import StatusBadge from "../../../components/admin/StatusBadge";
import { INFLUENCERS } from "../../../lib/adminData";

const NICHES = ["All", "Fashion", "Beauty", "Food", "Fitness", "Tech", "Wellness", "Travel"];

export default function InfluencersPage() {
  const [filter, setFilter]   = useState("All");
  const [search, setSearch]   = useState("");
  const [data, setData]       = useState(INFLUENCERS);

  const visible = data.filter(inf =>
    (filter === "All" || inf.niche === filter) &&
    (inf.name.toLowerCase().includes(search.toLowerCase()) ||
     inf.handle.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleStatus = (id) => {
    setData(prev => prev.map(inf =>
      inf.id === id
        ? { ...inf, status: inf.status === "active" ? "pending" : "active" }
        : inf
    ));
  };

  const TH = { padding: "10px 14px", fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #bbf7d0", textAlign: "left", background: "#f0fdf4" };
  const TD = { padding: "12px 14px", fontSize: 12, color: "#1f2937", borderBottom: "1px solid #f0fdf4", verticalAlign: "middle" };

  return (
    <>
      <Topbar title="Influencers" subtitle={`${data.length} registered influencers`} />
      <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>

        {/* Filters row */}
        <div style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap", alignItems: "center" }}>
          <div style={{ display: "flex", gap: 4, background: "#dcfce7", borderRadius: 8, padding: 3 }}>
            {NICHES.map(n => (
              <button key={n} onClick={() => setFilter(n)} style={{
                padding: "5px 12px", borderRadius: 6, border: "none",
                background: filter === n ? "#16a34a" : "transparent",
                color: filter === n ? "#fff" : "#374151",
                fontWeight: 600, fontSize: 11, cursor: "pointer",
              }}>{n}</button>
            ))}
          </div>
          <input
            placeholder="Search name or handle…"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{
              marginLeft: "auto", background: "#fff", border: "1px solid #bbf7d0",
              borderRadius: 8, padding: "7px 12px", fontSize: 12, color: "#1f2937", width: 200,
            }}
          />
          <button style={{ background: "#16a34a", color: "#fff", border: "none", borderRadius: 8, padding: "7px 16px", fontWeight: 600, fontSize: 12, cursor: "pointer" }}>
            + Add Influencer
          </button>
        </div>

        {/* Table */}
        <div style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 12, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Influencer","Handle","Niche","Followers","Match Rate","Status","Joined","Actions"].map(h => (
                  <th key={h} style={TH}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map(inf => (
                <tr key={inf.id} style={{ transition: "background .1s" }}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={TD}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div style={{
                        width: 30, height: 30, borderRadius: "50%",
                        background: "linear-gradient(135deg,#16a34a,#4ade80)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontWeight: 700, fontSize: 11, color: "#fff", flexShrink: 0,
                      }}>{inf.name.slice(0,2).toUpperCase()}</div>
                      <span style={{ fontWeight: 600, color: "#14532d" }}>{inf.name}</span>
                    </div>
                  </td>
                  <td style={{ ...TD, color: "#16a34a", fontWeight: 600 }}>{inf.handle}</td>
                  <td style={TD}>
                    <span style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>
                      {inf.niche}
                    </span>
                  </td>
                  <td style={{ ...TD, fontWeight: 600 }}>{inf.followers}</td>
                  <td style={TD}>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <div style={{ flex: 1, height: 4, background: "#f0fdf4", borderRadius: 2 }}>
                        <div style={{ width: inf.matchRate, height: "100%", background: "#16a34a", borderRadius: 2 }}/>
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 600, color: "#14532d", minWidth: 30 }}>{inf.matchRate}</span>
                    </div>
                  </td>
                  <td style={TD}><StatusBadge status={inf.status} /></td>
                  <td style={{ ...TD, color: "#6b7280" }}>{inf.joined}</td>
                  <td style={TD}>
                    <div style={{ display: "flex", gap: 6 }}>
                      <button onClick={() => toggleStatus(inf.id)} style={{
                        background: "#f0fdf4", border: "1px solid #bbf7d0",
                        borderRadius: 6, padding: "4px 10px", fontSize: 11,
                        cursor: "pointer", fontWeight: 600, color: "#16a34a",
                      }}>
                        {inf.status === "active" ? "Suspend" : "Activate"}
                      </button>
                      <button style={{
                        background: "#fff", border: "1px solid #bbf7d0",
                        borderRadius: 6, padding: "4px 10px", fontSize: 11,
                        cursor: "pointer", color: "#6b7280",
                      }}>View</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {visible.length === 0 && (
            <div style={{ textAlign: "center", padding: 40, color: "#9ca3af" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>🔍</div>
              <div>No influencers found</div>
            </div>
          )}
        </div>

        <div style={{ marginTop: 12, fontSize: 11, color: "#9ca3af" }}>
          Showing {visible.length} of {data.length} influencers
        </div>
      </div>
    </>
  );
}
