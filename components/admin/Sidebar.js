"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
{ href: "/", label: "Home", icon: "🏠" }, 
  { section: "Overview" },
  { href: "/admin/dashboard",   label: "Dashboard",    icon: "📊" },
  { href: "/admin/matches",     label: "Matches",      icon: "🤝", badge: "12" },
  { section: "Users" },
  { href: "/admin/influencers", label: "Influencers",  icon: "✨" },
  { href: "/admin/shops",       label: "Shops",        icon: "🏪" },
  { section: "Commerce" },
  { href: "/admin/offers",      label: "Offers",       icon: "💰", badge: "5 new", badgeGreen: true },
  { href: "/admin/messages",    label: "Messages",     icon: "💬", badge: "28" },
  { section: "System" },
  { href: "/admin/analytics",   label: "Analytics",    icon: "📈" },
];

export default function Sidebar() {
  const path = usePathname();

  return (
    <aside style={{
      width: 220, minWidth: 220, background: "#f0fdf4",
      borderRight: "1px solid #bbf7d0", display: "flex",
      flexDirection: "column", height: "100vh", position: "sticky", top: 0,
    }}>
      {/* Logo */}
      <div style={{
        padding: "20px 20px 16px", display: "flex", alignItems: "center",
        gap: 10, borderBottom: "1px solid #bbf7d0",
      }}>
        <Link href="/" style={{ textDecoration: "none" }}>
  <div style={{
    width: 34,
    height: 34,
    borderRadius: 8,
    background: "linear-gradient(135deg,#16a34a,#4ade80)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 800,
    fontSize: 16,
    color: "#fff",
    cursor: "pointer",
  }}>
    N
  </div>
</Link>
        <span style={{ fontSize: 17, fontWeight: 700, color: "#14532d" }}>NOX</span>
        <span style={{
          fontSize: 9, background: "#16a34a", color: "#fff",
          borderRadius: 4, padding: "2px 6px", fontWeight: 700,
        }}>ADMIN</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: "10px 10px", overflowY: "auto" }}>
        {NAV.map((item, i) =>
          item.section ? (
            <div key={i} style={{
              fontSize: 10, fontWeight: 700, color: "#6b7280",
              textTransform: "uppercase", letterSpacing: 1,
              padding: "12px 8px 4px",
            }}>{item.section}</div>
          ) : (
            <Link href={item.href} key={item.href} style={{ textDecoration: "none" }}>
              <div style={{
                display: "flex", alignItems: "center", gap: 10,
                padding: "9px 10px", borderRadius: 8, cursor: "pointer",
                background: path === item.href ? "#dcfce7" : "transparent",
                color: path === item.href ? "#16a34a" : "#374151",
                fontWeight: path === item.href ? 600 : 400,
                fontSize: 13, marginBottom: 1,
                transition: "all .15s",
              }}>
                <span style={{ width: 18, textAlign: "center" }}>{item.icon}</span>
                <span style={{ flex: 1 }}>{item.label}</span>
                {item.badge && (
                  <span style={{
                    background: item.badgeGreen ? "#dcfce7" : "#16a34a",
                    color: item.badgeGreen ? "#16a34a" : "#fff",
                    borderRadius: 10, fontSize: 10,
                    padding: "1px 7px", fontWeight: 600,
                  }}>{item.badge}</span>
                )}
              </div>
            </Link>
          )
        )}
      </nav>
      <Link href="/" style={{ textDecoration: "none" }}>
  <div style={{
    margin: "10px",
    padding: "8px 10px",
    borderRadius: 8,
    background: "#ecfdf5",
    color: "#16a34a",
    fontSize: 12,
    fontWeight: 600,
    textAlign: "center",
    cursor: "pointer",
  }}>
    ← Back to Main App
  </div>
</Link>

      {/* Footer */}
      <div style={{ padding: "12px 10px", borderTop: "1px solid #bbf7d0" }}>
        <div style={{
          display: "flex", alignItems: "center", gap: 8,
          padding: "8px 10px", borderRadius: 8, background: "#dcfce7",
        }}>
          <div style={{
            width: 28, height: 28, borderRadius: "50%",
            background: "linear-gradient(135deg,#16a34a,#4ade80)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontWeight: 700, fontSize: 11, color: "#fff",
          }}>SA</div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 600, color: "#14532d" }}>Super Admin</div>
            <div style={{ fontSize: 10, color: "#6b7280" }}>admin@nox.io</div>
          </div>
        </div>
      </div>
    </aside>
  );
}