"use client";
import { useState } from "react";
import StatusBadge from "./StatusBadge";

// DataTable.js
// Usage:
// <DataTable
//   columns={[
//     { key: "name",   label: "Name",   sortable: true },
//     { key: "status", label: "Status", badge: true },
//     { key: "joined", label: "Joined" },
//   ]}
//   rows={INFLUENCERS}
//   onAction={(action, row) => console.log(action, row)}
//   actions={["View", "Suspend"]}
//   searchKeys={["name", "handle"]}
// />

export default function DataTable({
  columns = [],
  rows = [],
  actions = [],
  onAction,
  searchKeys = [],
  emptyIcon = "🔍",
  emptyText = "No results found",
}) {
  const [search, setSearch]   = useState("");
  const [sortKey, setSortKey] = useState(null);
  const [sortAsc, setSortAsc] = useState(true);
  const [page, setPage]       = useState(1);
  const PER_PAGE = 8;

  // ── Filter ──────────────────────────────────────────────────────────────────
  const filtered = rows.filter((row) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return searchKeys.some((k) =>
      String(row[k] ?? "").toLowerCase().includes(q)
    );
  });

  // ── Sort ────────────────────────────────────────────────────────────────────
  const sorted = sortKey
    ? [...filtered].sort((a, b) => {
        const av = String(a[sortKey] ?? "").toLowerCase();
        const bv = String(b[sortKey] ?? "").toLowerCase();
        return sortAsc ? av.localeCompare(bv) : bv.localeCompare(av);
      })
    : filtered;

  // ── Paginate ────────────────────────────────────────────────────────────────
  const totalPages = Math.ceil(sorted.length / PER_PAGE);
  const paginated  = sorted.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSort = (key) => {
    if (sortKey === key) setSortAsc(!sortAsc);
    else { setSortKey(key); setSortAsc(true); }
    setPage(1);
  };

  const handleSearch = (val) => {
    setSearch(val);
    setPage(1);
  };

  // ── Styles ──────────────────────────────────────────────────────────────────
  const TH = {
    padding: "10px 14px",
    fontSize: 10,
    fontWeight: 700,
    color: "#6b7280",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    borderBottom: "1px solid #bbf7d0",
    textAlign: "left",
    background: "#f0fdf4",
    whiteSpace: "nowrap",
    userSelect: "none",
  };
  const TD = {
    padding: "11px 14px",
    fontSize: 12,
    color: "#1f2937",
    borderBottom: "1px solid #f0fdf4",
    verticalAlign: "middle",
  };

  return (
    <div>
      {/* ── Search bar ── */}
      {searchKeys.length > 0 && (
        <div style={{ marginBottom: 12 }}>
          <input
            placeholder={`Search ${searchKeys.join(", ")}…`}
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            style={{
              background: "#fff",
              border: "1px solid #bbf7d0",
              borderRadius: 8,
              padding: "7px 12px",
              fontSize: 12,
              color: "#1f2937",
              width: 240,
              outline: "none",
            }}
          />
        </div>
      )}

      {/* ── Table ── */}
      <div style={{ background: "#fff", border: "1px solid #bbf7d0", borderRadius: 12, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    ...TH,
                    cursor: col.sortable ? "pointer" : "default",
                  }}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  {col.label}
                  {col.sortable && (
                    <span style={{ marginLeft: 4, opacity: sortKey === col.key ? 1 : 0.3 }}>
                      {sortKey === col.key ? (sortAsc ? "↑" : "↓") : "↕"}
                    </span>
                  )}
                </th>
              ))}
              {actions.length > 0 && (
                <th style={TH}>Actions</th>
              )}
            </tr>
          </thead>

          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (actions.length > 0 ? 1 : 0)}
                  style={{ textAlign: "center", padding: "40px 0", color: "#9ca3af" }}
                >
                  <div style={{ fontSize: 32, marginBottom: 8 }}>{emptyIcon}</div>
                  <div style={{ fontSize: 13 }}>{emptyText}</div>
                </td>
              </tr>
            ) : (
              paginated.map((row, ri) => (
                <tr
                  key={row.id ?? ri}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "#f0fdf4")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  style={{ transition: "background .1s" }}
                >
                  {columns.map((col) => (
                    <td key={col.key} style={TD}>
                      {col.badge ? (
                        <StatusBadge status={row[col.key]} />
                      ) : col.avatar ? (
                        // Avatar + text cell
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{
                            width: 28, height: 28, borderRadius: col.avatarRound ? "50%" : 8,
                            background: "linear-gradient(135deg,#16a34a,#4ade80)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            fontWeight: 700, fontSize: 10, color: "#fff", flexShrink: 0,
                          }}>
                            {String(row[col.key] ?? "").slice(0, 2).toUpperCase()}
                          </div>
                          <span style={{ fontWeight: 600, color: "#14532d" }}>{row[col.key]}</span>
                        </div>
                      ) : col.pill ? (
                        <span style={{
                          background: "#dcfce7", color: "#16a34a",
                          borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 600,
                        }}>{row[col.key]}</span>
                      ) : col.bar ? (
                        // Progress bar cell
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <div style={{ flex: 1, height: 4, background: "#f0fdf4", borderRadius: 2 }}>
                            <div style={{
                              width: row[col.key], height: "100%",
                              background: "#16a34a", borderRadius: 2,
                            }} />
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, color: "#14532d", minWidth: 30 }}>
                            {row[col.key]}
                          </span>
                        </div>
                      ) : col.mono ? (
                        <span style={{ fontFamily: "monospace", fontSize: 11, color: "#9ca3af" }}>
                          {row[col.key]}
                        </span>
                      ) : (
                        <span style={col.bold ? { fontWeight: 600, color: "#14532d" } : { color: "#6b7280" }}>
                          {row[col.key]}
                        </span>
                      )}
                    </td>
                  ))}

                  {/* Actions column */}
                  {actions.length > 0 && (
                    <td style={TD}>
                      <div style={{ display: "flex", gap: 5 }}>
                        {actions.map((action) => (
                          <button
                            key={action}
                            onClick={() => onAction?.(action, row)}
                            style={{
                              background: action === "Approve" || action === "Activate"
                                ? "#16a34a" : action === "Suspend" || action === "Close"
                                ? "#fee2e2" : "#f0fdf4",
                              color: action === "Approve" || action === "Activate"
                                ? "#fff" : action === "Suspend" || action === "Close"
                                ? "#dc2626" : "#374151",
                              border: "1px solid #bbf7d0",
                              borderRadius: 6,
                              padding: "4px 10px",
                              fontSize: 10,
                              fontWeight: 600,
                              cursor: "pointer",
                            }}
                          >
                            {action}
                          </button>
                        ))}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          marginTop: 12, fontSize: 12, color: "#6b7280",
        }}>
          <span>
            Showing {(page - 1) * PER_PAGE + 1}–{Math.min(page * PER_PAGE, sorted.length)} of {sorted.length}
          </span>
          <div style={{ display: "flex", gap: 4 }}>
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: 6, padding: "4px 10px", fontSize: 11,
                cursor: page === 1 ? "not-allowed" : "pointer",
                opacity: page === 1 ? 0.4 : 1, color: "#374151",
              }}
            >← Prev</button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                style={{
                  background: p === page ? "#16a34a" : "#f0fdf4",
                  color: p === page ? "#fff" : "#374151",
                  border: "1px solid #bbf7d0",
                  borderRadius: 6, padding: "4px 10px",
                  fontSize: 11, cursor: "pointer", fontWeight: p === page ? 700 : 400,
                }}
              >{p}</button>
            ))}

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              style={{
                background: "#f0fdf4", border: "1px solid #bbf7d0",
                borderRadius: 6, padding: "4px 10px", fontSize: 11,
                cursor: page === totalPages ? "not-allowed" : "pointer",
                opacity: page === totalPages ? 0.4 : 1, color: "#374151",
              }}
            >Next →</button>
          </div>
        </div>
      )}
    </div>
  );
}