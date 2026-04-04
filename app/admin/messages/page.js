"use client";
import Topbar from "@/components/admin/Topbar";

const CONVERSATIONS = [
  { id: 1, influencer: "Priya Sharma",  shop: "Zara India",     preview: "Sounds good! I can post by Friday.", time: "2m ago",  unread: true,  flagged: false },
  { id: 2, influencer: "Sneha Kapoor",  shop: "Nykaa Beauty",   preview: "Can we discuss the deliverables?",   time: "14m ago", unread: true,  flagged: false },
  { id: 3, influencer: "Kabir Singh",   shop: "Mango Fashion",  preview: "I won't do it for less than 30K",    time: "1h ago",  unread: false, flagged: true },
  { id: 4, influencer: "Ankita Joshi",  shop: "FoodBox Co.",    preview: "Reel is ready, review link inside.", time: "2h ago",  unread: false, flagged: false },
  { id: 5, influencer: "Arjun Mehta",   shop: "GymNation",      preview: "When will the product ship?",        time: "3h ago",  unread: false, flagged: false },
  { id: 6, influencer: "Meera Pillai",  shop: "WellnessFirst",  preview: "Contract signed, let's begin!",      time: "5h ago",  unread: false, flagged: false },
];

export default function MessagesPage() {
  return (
    <>
      <Topbar title="Messages" subtitle="Monitor all influencer ↔ shop conversations" />
      <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 10, marginBottom: 18 }}>
          {[
            { label: "Active Threads", val: 28,  icon: "💬", color: "#16a34a" },
            { label: "Unread",         val: 6,   icon: "🔴", color: "#f59e0b" },
            { label: "Flagged",        val: 1,   icon: "🚩", color: "#ef4444" },
          ].map(c => (
            <div key={c.label} style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 10, padding: "14px 18px", display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 24 }}>{c.icon}</span>
              <div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: 0.5 }}>{c.label}</div>
                <div style={{ fontSize: 24, fontWeight: 800, color: c.color }}>{c.val}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 12, overflow: "hidden" }}>
          <div style={{ padding: "14px 16px", borderBottom: "1px solid #f0fdf4", fontWeight: 600, fontSize: 13, color: "#14532d" }}>
            Conversation Monitor
          </div>
          {CONVERSATIONS.map(c => (
            <div key={c.id} style={{
              display: "flex", alignItems: "center", gap: 14, padding: "14px 16px",
              borderBottom: "1px solid #f0fdf4",
              background: c.flagged ? "#fff7ed" : c.unread ? "#f0fdf4" : "transparent",
              cursor: "pointer",
            }}
              onMouseEnter={e => !c.flagged && !c.unread && (e.currentTarget.style.background = "#f9fafb")}
              onMouseLeave={e => !c.flagged && !c.unread && (e.currentTarget.style.background = "transparent")}
            >
              {c.flagged && <span style={{ fontSize: 16 }}>🚩</span>}
              {!c.flagged && c.unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#16a34a", flexShrink: 0 }}/>}
              {!c.flagged && !c.unread && <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#e5e7eb", flexShrink: 0 }}/>}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 2 }}>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#14532d" }}>{c.influencer}</span>
                  <span style={{ color: "#9ca3af", fontSize: 12 }}>↔</span>
                  <span style={{ fontWeight: 600, fontSize: 13, color: "#374151" }}>{c.shop}</span>
                  {c.flagged && <span style={{ background: "#fee2e2", color: "#dc2626", borderRadius: 4, fontSize: 9, padding: "1px 6px", fontWeight: 700 }}>FLAGGED</span>}
                </div>
                <div style={{ fontSize: 12, color: "#6b7280", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {c.preview}
                </div>
              </div>
              <div style={{ fontSize: 11, color: "#9ca3af", flexShrink: 0 }}>{c.time}</div>
              <button style={{ background: "#f0fdf4", border: "1px solid #bbf7d0", borderRadius: 6, padding: "4px 10px", fontSize: 11, cursor: "pointer", color: "#16a34a", fontWeight: 600 }}>
                View
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}