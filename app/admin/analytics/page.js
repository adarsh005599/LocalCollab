"use client";
import Topbar from "../../../components/admin/Topbar";
import { WEEKLY_MATCHES, STATS } from "../../../lib/adminData";

const MONTHLY = [
  { month: "Oct", matches: 420, gmv: 180000 },
  { month: "Nov", matches: 510, gmv: 215000 },
  { month: "Dec", matches: 640, gmv: 290000 },
  { month: "Jan", matches: 580, gmv: 260000 },
  { month: "Feb", matches: 720, gmv: 330000 },
  { month: "Mar", matches: 890, gmv: 420000 },
];

const TOP_INFLUENCERS = [
  { name: "Sneha Kapoor", matches: 48, gmv: "₹82K", niche: "Beauty" },
  { name: "Priya Sharma",  matches: 42, gmv: "₹70K", niche: "Fashion" },
  { name: "Ankita Joshi",  matches: 37, gmv: "₹56K", niche: "Food" },
  { name: "Rohan Gupta",   matches: 31, gmv: "₹48K", niche: "Travel" },
  { name: "Arjun Mehta",   matches: 28, gmv: "₹39K", niche: "Fitness" },
];

export default function AnalyticsPage() {
  const maxMatches = Math.max(...MONTHLY.map(m => m.matches));
  const maxGmv     = Math.max(...MONTHLY.map(m => m.gmv));

  return (
    <>
      <Topbar title="Analytics" subtitle="Platform growth & performance metrics" />
      <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>

        {/* KPI row */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
          {[
            { label: "Match conversion",  val: "68%",   delta: "+4%",  up: true },
            { label: "Avg offer value",   val: "₹13.2K", delta: "+9%", up: true },
            { label: "Shop retention",    val: "84%",   delta: "+2%",  up: true },
            { label: "Influencer churn",  val: "7%",    delta: "-1%",  up: false },
          ].map(k => (
            <div key={k.label} style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 12, padding: "16px 18px" }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>{k.label}</div>
              <div style={{ fontSize: 26, fontWeight: 800, color: "#14532d", marginBottom: 4 }}>{k.val}</div>
              <div style={{ fontSize: 11, color: k.up ? "#16a34a" : "#ef4444" }}>{k.up ? "▲" : "▼"} {k.delta} MoM</div>
            </div>
          ))}
        </div>

        {/* Monthly charts side by side */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 }}>
          {[
            { title: "Monthly Matches", key: "matches", max: maxMatches, color: "#16a34a", fmt: v => v },
            { title: "Monthly GMV (₹)", key: "gmv",     max: maxGmv,     color: "#4ade80", fmt: v => `₹${(v/1000).toFixed(0)}K` },
          ].map(chart => (
            <div key={chart.title} style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 12, padding: "16px 20px" }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: "#14532d", marginBottom: 12 }}>{chart.title}</div>
              <div style={{ display: "flex", alignItems: "flex-end", gap: 8, height: 130 }}>
                {MONTHLY.map(m => (
                  <div key={m.month} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <span style={{ fontSize: 9, color: "#6b7280" }}>{chart.fmt(m[chart.key])}</span>
                    <div style={{
                      width: "100%", borderRadius: "4px 4px 0 0",
                      background: `linear-gradient(180deg,${chart.color},#86efac)`,
                      height: `${Math.round((m[chart.key] / chart.max) * 100)}px`,
                    }}/>
                    <span style={{ fontSize: 9, color: "#6b7280" }}>{m.month}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Top influencers table */}
        <div style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0fdf4", fontWeight: 600, fontSize: 13, color: "#14532d" }}>
            Top performing influencers
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                {["Rank","Influencer","Niche","Total Matches","Revenue Generated","Match bar"].map(h => (
                  <th key={h} style={{ padding: "10px 14px", fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5, borderBottom: "1px solid #bbf7d0", textAlign: "left", background: "#f0fdf4" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {TOP_INFLUENCERS.map((inf, i) => (
                <tr key={inf.name}
                  onMouseEnter={e => e.currentTarget.style.background = "#f0fdf4"}
                  onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                >
                  <td style={{ padding: "12px 14px", fontSize: 14, fontWeight: 800, color: i === 0 ? "#f59e0b" : "#9ca3af", borderBottom: "1px solid #f0fdf4" }}>
                    {i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : `#${i+1}`}
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 12, borderBottom: "1px solid #f0fdf4" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <div style={{ width: 28, height: 28, borderRadius: "50%", background: "linear-gradient(135deg,#16a34a,#4ade80)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 10, color: "#fff" }}>
                        {inf.name.slice(0,2).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: "#14532d" }}>{inf.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 12, borderBottom: "1px solid #f0fdf4" }}>
                    <span style={{ background: "#dcfce7", color: "#16a34a", borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600 }}>{inf.niche}</span>
                  </td>
                  <td style={{ padding: "12px 14px", fontSize: 13, fontWeight: 700, color: "#14532d", borderBottom: "1px solid #f0fdf4" }}>{inf.matches}</td>
                  <td style={{ padding: "12px 14px", fontSize: 12, fontWeight: 700, color: "#16a34a", borderBottom: "1px solid #f0fdf4" }}>{inf.gmv}</td>
                  <td style={{ padding: "12px 14px", borderBottom: "1px solid #f0fdf4" }}>
                    <div style={{ background: "#f0fdf4", borderRadius: 4, height: 6, width: 120 }}>
                      <div style={{ background: "#16a34a", height: "100%", borderRadius: 4, width: `${Math.round((inf.matches / 48) * 100)}%` }}/>
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