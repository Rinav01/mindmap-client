import { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import TopBar from "../../components/layout/TopBar";
import { useNavigate } from "react-router-dom";
import { useMapsStore } from "../../store/mapsStore";
import type { Map } from "../../store/mapsStore";

// Mini SVG thumbnail previews for map cards
function MapThumbnail({ index }: { index: number }) {
  const variants = [
    // Single node centered
    <svg key="a" width="100%" height="100%" viewBox="0 0 200 120" fill="none">
      <rect x="70" y="45" width="60" height="30" rx="8" fill="#3b82f6" opacity="0.9" />
      <rect x="20" y="75" width="50" height="22" rx="6" fill="#374151" />
      <rect x="130" y="75" width="50" height="22" rx="6" fill="#374151" />
      <line x1="100" y1="75" x2="45" y2="97" stroke="#4b5563" strokeWidth="1.5" />
      <line x1="100" y1="75" x2="155" y2="97" stroke="#4b5563" strokeWidth="1.5" />
    </svg>,
    // Two-level tree
    <svg key="b" width="100%" height="100%" viewBox="0 0 200 120" fill="none">
      <rect x="75" y="20" width="50" height="28" rx="7" fill="#3b82f6" opacity="0.85" />
      <rect x="15" y="70" width="44" height="22" rx="6" fill="#374151" />
      <rect x="68" y="70" width="44" height="22" rx="6" fill="#374151" />
      <rect x="121" y="70" width="44" height="22" rx="6" fill="#374151" />
      <line x1="100" y1="48" x2="37" y2="70" stroke="#4b5563" strokeWidth="1.5" />
      <line x1="100" y1="48" x2="90" y2="70" stroke="#4b5563" strokeWidth="1.5" />
      <line x1="100" y1="48" x2="143" y2="70" stroke="#4b5563" strokeWidth="1.5" />
    </svg>,
    // Bar chart style
    <svg key="c" width="100%" height="100%" viewBox="0 0 200 120" fill="none">
      <rect x="40" y="60" width="24" height="50" rx="4" fill="#3b82f6" opacity="0.7" />
      <rect x="72" y="40" width="24" height="70" rx="4" fill="#3b82f6" opacity="0.85" />
      <rect x="104" y="50" width="24" height="60" rx="4" fill="#3b82f6" opacity="0.7" />
      <rect x="136" y="30" width="24" height="80" rx="4" fill="#3b82f6" />
    </svg>,
  ];
  return variants[index % variants.length];
}

const columns = [
  { key: "drafts", label: "Drafts", color: "#9ca3af" },
  { key: "inProgress", label: "In Progress", color: "#3b82f6" },
  { key: "completed", label: "Completed", color: "#22c55e" },
];

export default function DashboardPage() {
  const navigate = useNavigate();
  const { maps, loadMaps, createMap } = useMapsStore();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    loadMaps();
  }, []);

  const handleCreate = async () => {
    const map = await createMap();
    navigate(`/editor/${map._id}`);
  };

  // Distribute maps across columns for display
  const columnMaps: Record<string, Map[]> = {
    drafts: [],
    inProgress: maps.slice(0, Math.ceil(maps.length / 2)),
    completed: maps.slice(Math.ceil(maps.length / 2)),
  };

  const timeAgo = (i: number) => {
    const labels = ["2 hours ago", "Yesterday", "Oct 12, 2023", "3 days ago"];
    return labels[i % labels.length];
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f172a", fontFamily: "Inter, sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ padding: "20px 28px 0", borderBottom: "1px solid #1f2937" }}>
          <TopBar onNewMap={handleCreate} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>
          {/* Heading row */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: "24px" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "white", letterSpacing: "-0.3px" }}>
                Project Workflow
              </h1>
              <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "13px" }}>
                Pick up where you left off
              </p>
            </div>

            {/* Grid / List toggle */}
            <div style={{ display: "flex", gap: "4px", background: "#1f2937", borderRadius: "8px", padding: "3px" }}>
              {(["grid", "list"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  style={{
                    padding: "5px 8px", borderRadius: "6px", border: "none", cursor: "pointer",
                    background: viewMode === mode ? "#374151" : "transparent",
                    color: viewMode === mode ? "white" : "#6b7280",
                    display: "flex", alignItems: "center",
                  }}
                >
                  {mode === "grid" ? (
                    <svg width="14" height="14" fill="currentColor" viewBox="0 0 24 24">
                      <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  ) : (
                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="18" x2="21" y2="18" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Kanban columns */}
          <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
            {columns.map((col) => {
              const colMaps = columnMaps[col.key];
              return (
                <div key={col.key} style={{ flex: 1, minWidth: 0 }}>
                  {/* Column header */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: col.color, display: "inline-block" }} />
                      <span style={{ color: "white", fontSize: "14px", fontWeight: 600 }}>{col.label}</span>
                      <span style={{ color: "#6b7280", fontSize: "13px" }}>{col.key === "drafts" ? 1 : colMaps.length}</span>
                    </div>
                    <button style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "16px" }}>···</button>
                  </div>

                  {/* Cards */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {/* Create card (Drafts only) */}
                    {col.key === "drafts" && (
                      <button
                        onClick={handleCreate}
                        style={{
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          gap: "10px", padding: "28px 16px",
                          background: "transparent", border: "2px dashed #374151",
                          borderRadius: "12px", cursor: "pointer", color: "#6b7280",
                          fontSize: "13px", fontWeight: 500, transition: "border-color 0.15s, color 0.15s",
                          width: "100%",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#3b82f6"; (e.currentTarget as HTMLButtonElement).style.color = "#3b82f6"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#374151"; (e.currentTarget as HTMLButtonElement).style.color = "#6b7280"; }}
                      >
                        <div style={{
                          width: "36px", height: "36px", borderRadius: "50%",
                          border: "2px dashed currentColor", display: "flex", alignItems: "center", justifyContent: "center",
                          fontSize: "22px", lineHeight: 1,
                        }}>+</div>
                        Create New Project
                      </button>
                    )}

                    {/* Map cards */}
                    {colMaps.map((map, i) => (
                      <button
                        key={map._id}
                        onClick={() => navigate(`/editor/${map._id}`)}
                        style={{
                          display: "flex", flexDirection: "column", padding: "0",
                          background: "#1e293b", border: "1px solid #1f2937",
                          borderRadius: "12px", cursor: "pointer", textAlign: "left",
                          overflow: "hidden", transition: "border-color 0.15s, transform 0.15s",
                          width: "100%",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#3b82f6"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#1f2937"; (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)"; }}
                      >
                        {/* Thumbnail */}
                        <div style={{ height: "110px", background: "#0f172a", overflow: "hidden", position: "relative" }}>
                          <MapThumbnail index={i} />
                          {map.isStarred && (
                            <div style={{ position: "absolute", top: "8px", right: "8px" }}>
                              <svg width="14" height="14" fill="#f59e0b" viewBox="0 0 24 24">
                                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div style={{ padding: "12px 14px" }}>
                          <div style={{ color: "white", fontSize: "13px", fontWeight: 600, marginBottom: "6px" }}>
                            {map.title}
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "#6b7280", fontSize: "11px" }}>
                            <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                              <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                            </svg>
                            EDITED {timeAgo(i).toUpperCase()}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
