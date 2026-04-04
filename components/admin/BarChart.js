"use client";

// BarChart.js
// Usage:
// <BarChart
//   data={[{ label: "W1", value: 98 }, { label: "W2", value: 134 }]}
//   color="#16a34a"
//   height={140}
//   title="Matches over 8 weeks"
// />

export default function BarChart({ data = [], color = "#16a34a", height = 140, title }) {
  if (!data.length) return null;

  const maxVal = Math.max(...data.map((d) => d.value));

  return (
    <div>
      {title && (
        <div style={{ fontWeight: 600, fontSize: 13, color: "#14532d", marginBottom: 12 }}>
          {title}
        </div>
      )}

      {/* Bars */}
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: 6,
          height: height,
        }}
      >
        {data.map((item, i) => {
          const barH = Math.round((item.value / maxVal) * (height - 30));
          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
              }}
              title={`${item.label}: ${item.value}`}
            >
              {/* Value on top */}
              <span style={{ fontSize: 9, color: "#6b7280", lineHeight: 1 }}>
                {item.value}
              </span>

              {/* Bar */}
              <div
                style={{
                  width: "100%",
                  height: barH,
                  borderRadius: "4px 4px 0 0",
                  background: `linear-gradient(180deg, ${color}, ${lighten(color)})`,
                  transition: "height 0.3s ease, opacity 0.2s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.75")}
                onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
              />

              {/* Label below */}
              <span style={{ fontSize: 9, color: "#6b7280", lineHeight: 1 }}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* X-axis line */}
      <div
        style={{
          height: 1,
          background: "#bbf7d0",
          marginTop: 4,
          borderRadius: 1,
        }}
      />
    </div>
  );
}

// Helper: returns a lighter shade for gradient bottom
function lighten(hex) {
  const map = {
    "#16a34a": "#4ade80",
    "#4ade80": "#86efac",
    "#f59e0b": "#fcd34d",
    "#60a5fa": "#93c5fd",
    "#a78bfa": "#c4b5fd",
    "#f472b6": "#f9a8d4",
  };
  return map[hex] || hex + "99";
}