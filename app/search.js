"use client";
import { useEffect, useState } from "react";
import { Search, MapPin } from "lucide-react";

const placeholders = [
  "Food influencers...",
  "Fitness creators...",
  "Fashion bloggers...",
  "Local vloggers..."
];

export default function SearchBar({ C, searchQuery, setSearchQuery, searchCity, setSearchCity }) {
  const [placeholderIndex, setPlaceholderIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setPlaceholderIndex((prev) => (prev + 1) % placeholders.length);
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className="search-wrapper"
      style={{
        background: C.surface,
        borderRadius: 100,
        padding: "10px 10px 10px 28px",
        display: "flex",
        alignItems: "center",
        boxShadow: "0 25px 50px -12px rgba(0,0,0,0.12)",
        maxWidth: 880,
        margin: "0 auto",
        flexWrap: "wrap",
        gap: 10,
        transition: "all 0.3s ease",
      }}
    >
      {/* LEFT INPUT */}
      <div style={{ flex: 2, display: "flex", alignItems: "center", gap: 12, minWidth: 200 }}>
        <Search size={20} color={C.textMuted} />
        <input
          type="text"
          placeholder={placeholders[placeholderIndex]}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            border: "none",
            background: "transparent",
            outline: "none",
            width: "100%",
            fontSize: 16,
            color: C.text,
          }}
        />
      </div>

      {/* DIVIDER */}
      <div style={{ width: 1, height: 30, background: C.border }} className="hidden-mobile" />

      {/* LOCATION INPUT */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 12, minWidth: 150 }}>
        <MapPin size={20} color={C.textMuted} />
        <input
          type="text"
          placeholder="City or area"
          value={searchCity}
          onChange={(e) => setSearchCity(e.target.value)}
          style={{
            border: "none",
            background: "transparent",
            outline: "none",
            width: "100%",
            fontSize: 16,
            color: C.text,
          }}
        />
      </div>

      {/* BUTTON */}
      <button
        style={{
          borderRadius: 100,
          padding: "14px 30px",
          fontSize: 15,
          fontWeight: 600,
          background: "#397754",
          color: "#fff",
          border: "none",
          cursor: "pointer",
          transition: "all 0.25s ease",
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = "scale(1.05)";
          e.currentTarget.style.boxShadow = "0 10px 25px rgba(22,163,74,0.3)";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = "scale(1)";
          e.currentTarget.style.boxShadow = "none";
        }}
      >
        Search Creators
      </button>

      {/* STYLE */}
      <style>{`
        .search-wrapper:hover {
          transform: translateY(-2px);
          box-shadow: 0 30px 60px -15px rgba(0,0,0,0.15);
        }

        .search-wrapper:focus-within {
          box-shadow: 0 0 0 3px rgba(22,163,74,0.2), 
                      0 25px 50px -12px rgba(0,0,0,0.12);
        }
      `}</style>
    </div>
  );
}