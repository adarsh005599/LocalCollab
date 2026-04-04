"use client";

import { useEffect, useState } from "react";

export default function DashboardPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/admin/stats");
        const data = await res.json();
        setStats(data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchStats();
  }, []);

  return (
    <div style={{ padding: "24px", width: "100%" }}>
      {/* HEADER */}
      <h1 style={{ fontSize: "24px", fontWeight: "600", marginBottom: "20px" }}>
        Admin Dashboard
      </h1>

      {/* STATS GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <Card title="Total Users" value={stats?.totalUsers} />
        <Card title="Influencers" value={stats?.totalInfluencers} />
        <Card title="Shops" value={stats?.totalShops} />
        <Card title="Matches" value={stats?.totalMatches} />
        <Card title="Revenue" value={`₹${stats?.revenue}`} />
      </div>

      {/* EXTRA SECTION */}
      <div
        style={{
          marginTop: "30px",
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: "20px",
        }}
      >
        {/* Activity */}
        <div
          style={{
            background: "#fff",
            borderRadius: "12px",
            padding: "20px",
            boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>Recent Activity</h3>
          <p style={{ color: "#666" }}>
            New influencer joined, new matches created, offers updated...
          </p>
        </div>

        {/* Quick Info */}
        <div
          style={{
            background: "#ecfdf5",
            borderRadius: "12px",
            padding: "20px",
          }}
        >
          <h3 style={{ marginBottom: "10px" }}>Quick Info</h3>
          <p>Total Platform Growth 📈</p>
          <p style={{ fontWeight: "bold", fontSize: "20px" }}>+24%</p>
        </div>
      </div>
    </div>
  );
}

function Card({ title, value }) {
  return (
    <div
      style={{
        background: "#ffffff",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 2px 10px rgba(0,0,0,0.05)",
      }}
    >
      <p style={{ color: "#666", fontSize: "14px" }}>{title}</p>
      <h2 style={{ fontSize: "22px", fontWeight: "600", marginTop: "5px" }}>
        {value ?? "..."}
      </h2>
    </div>
  );
}