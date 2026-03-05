import { useEffect, useState } from "react";
import Sidebar from "../../components/layout/Sidebar";
import Topbar from "../../components/layout/Topbar";
import { useNavigate } from "react-router-dom";
import { useMapsStore } from "../../store/mapsStore";
import type { Map } from "../../store/mapsStore";
import { THUMBNAILS, TIER_COLORS, getTier } from "./MapThumbnails";
import TemplateGallery from "../../components/dashboard/TemplateGallery";

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function MapCard({
  map,
  onOpen,
  onDelete,
  onToggleStar,
}: {
  map: Map;
  onOpen: () => void;
  onDelete: () => void;
  onToggleStar: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const nodeCount = map.nodeCount ?? 1;
  const tier = getTier(nodeCount);
  const tierColor = TIER_COLORS[tier];

  const thumbnail = THUMBNAILS[tier];

  return (
    <div
      style={{ position: "relative", borderRadius: "14px", overflow: "hidden" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmDelete(false); }}
    >
      {/* Main clickable card */}
      <button
        onClick={onOpen}
        style={{
          display: "flex", flexDirection: "column", width: "100%",
          background: "#1e293b",
          border: `1px solid ${hovered ? tierColor : "#1f2937"}`,
          borderRadius: "14px", cursor: "pointer", textAlign: "left",
          overflow: "hidden",
          transition: "border-color 0.15s, transform 0.15s, box-shadow 0.15s",
          transform: hovered ? "translateY(-2px)" : "translateY(0)",
          boxShadow: hovered ? `0 8px 24px rgba(0,0,0,0.3)` : "0 1px 4px rgba(0,0,0,0.15)",
        }}
      >
        {/* Thumbnail */}
        <div style={{
          height: "110px", background: "#0f172a",
          overflow: "hidden", position: "relative",
          borderBottom: "1px solid #1f2937",
        }}>
          {thumbnail}

          {/* Gradient overlay */}
          <div style={{
            position: "absolute", inset: 0,
            background: "linear-gradient(to bottom, transparent 60%, rgba(15,23,42,0.4))",
          }} />
        </div>

        {/* Info */}
        <div style={{ padding: "12px 14px 14px" }}>
          <div style={{
            color: "white", fontSize: "13px", fontWeight: 600,
            marginBottom: "6px", whiteSpace: "nowrap",
            overflow: "hidden", textOverflow: "ellipsis",
          }}>
            {map.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "5px", color: "#6b7280", fontSize: "11px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
              </svg>
              Edited {relativeTime(map.updatedAt)}
            </div>
            <span style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em",
              color: tierColor,
              background: `${tierColor}18`,
              border: `1px solid ${tierColor}44`,
              borderRadius: "99px", padding: "2px 8px",
              whiteSpace: "nowrap",
            }}>
              {nodeCount} node{nodeCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </button>

      {/* â”€â”€â”€ Overlay action buttons (visible on hover) â”€â”€â”€ */}
      <div style={{
        position: "absolute", top: "8px", right: "8px",
        display: "flex", flexDirection: "column", gap: "4px",
        opacity: hovered ? 1 : 0,
        transform: hovered ? "scale(1)" : "scale(0.85)",
        transition: "opacity 0.15s ease, transform 0.15s ease",
        pointerEvents: hovered ? "auto" : "none",
      }}>
        {/* Star toggle */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleStar(); }}
          title={map.isStarred ? "Unstar" : "Star"}
          style={{
            width: "28px", height: "28px", borderRadius: "8px",
            background: map.isStarred ? "rgba(245,158,11,0.2)" : "rgba(15,23,42,0.85)",
            border: `1px solid ${map.isStarred ? "rgba(245,158,11,0.5)" : "rgba(255,255,255,0.1)"}`,
            color: map.isStarred ? "#f59e0b" : "#9ca3af",
            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
            backdropFilter: "blur(4px)",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#f59e0b"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = map.isStarred ? "#f59e0b" : "#9ca3af"; }}
        >
          <svg width="13" height="13" fill={map.isStarred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        </button>

        {/* Delete */}
        {!confirmDelete ? (
          <button
            onClick={(e) => { e.stopPropagation(); setConfirmDelete(true); }}
            title="Delete map"
            style={{
              width: "28px", height: "28px", borderRadius: "8px",
              background: "rgba(15,23,42,0.85)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#9ca3af", cursor: "pointer",
              display: "flex", alignItems: "center", justifyContent: "center",
              backdropFilter: "blur(4px)",
              transition: "background 0.15s, color 0.15s, border-color 0.15s",
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.4)";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.12)";
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
              (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(255,255,255,0.1)";
              (e.currentTarget as HTMLButtonElement).style.background = "rgba(15,23,42,0.85)";
            }}
          >
            <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6" />
              <path d="M9 6V4h6v2" />
            </svg>
          </button>
        ) : (
          /* Confirm delete pill */
          <div style={{
            display: "flex", gap: "3px",
            background: "rgba(15,23,42,0.95)", border: "1px solid rgba(239,68,68,0.4)",
            borderRadius: "8px", padding: "3px",
            backdropFilter: "blur(4px)",
          }}>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              style={{
                padding: "3px 7px", borderRadius: "5px",
                background: "#ef4444", border: "none",
                color: "white", fontSize: "10px", fontWeight: 700,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}
            >
              DELETE
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); setConfirmDelete(false); }}
              style={{
                padding: "3px 6px", borderRadius: "5px",
                background: "transparent", border: "none",
                color: "#9ca3af", fontSize: "10px",
                cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}
            >
              âœ•
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// â”€â”€â”€ Trash Card â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

function TrashCard({
  map,
  onRestore,
  onDeleteForever,
}: {
  map: Map;
  onRestore: () => void;
  onDeleteForever: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const [confirmPerm, setConfirmPerm] = useState(false);
  const nodeCount = map.nodeCount ?? 1;
  const tier = getTier(nodeCount);
  const tierColor = TIER_COLORS[tier];

  return (
    <div
      style={{ position: "relative", borderRadius: "14px", overflow: "hidden" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setConfirmPerm(false); }}
    >
      {/* Card body */}
      <div style={{
        display: "flex", flexDirection: "column",
        background: "#1e293b", opacity: 0.75,
        border: "1px solid #1f2937", borderRadius: "14px", overflow: "hidden",
      }}>
        {/* Thumbnail */}
        <div style={{ height: "110px", background: "#0f172a", overflow: "hidden", position: "relative", borderBottom: "1px solid #1f2937" }}>
          {THUMBNAILS[tier]}
          {/* Red tint overlay */}
          <div style={{ position: "absolute", inset: 0, background: "rgba(239,68,68,0.06)" }} />
        </div>
        {/* Info */}
        <div style={{ padding: "12px 14px 14px" }}>
          <div style={{ color: "#9ca3af", fontSize: "13px", fontWeight: 600, marginBottom: "5px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
            {map.title}
          </div>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "5px", color: "#6b7280", fontSize: "11px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
              <svg width="10" height="10" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              </svg>
              Deleted {relativeTime(map.deletedAt ?? map.updatedAt)}
            </div>
            <span style={{
              fontSize: "10px", fontWeight: 700, letterSpacing: "0.04em",
              color: tierColor, background: `${tierColor}18`,
              border: `1px solid ${tierColor}44`,
              borderRadius: "99px", padding: "2px 8px", whiteSpace: "nowrap",
            }}>
              {nodeCount} node{nodeCount !== 1 ? "s" : ""}
            </span>
          </div>
        </div>
      </div>

      {/* Action overlay on hover */}
      <div style={{
        position: "absolute", inset: 0, borderRadius: "14px",
        background: "rgba(15,23,42,0.55)", backdropFilter: "blur(2px)",
        display: "flex", flexDirection: "column",
        alignItems: "center", justifyContent: "center", gap: "8px",
        opacity: hovered ? 1 : 0,
        transition: "opacity 0.15s ease",
        pointerEvents: hovered ? "auto" : "none",
      }}>
        <button
          onClick={onRestore}
          style={{
            padding: "7px 20px", borderRadius: "8px",
            background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.4)",
            color: "#34d399", fontSize: "12px", fontWeight: 700,
            cursor: "pointer", fontFamily: "Inter, sans-serif", width: "140px",
          }}
        >
          â†º Restore
        </button>

        {!confirmPerm ? (
          <button
            onClick={() => setConfirmPerm(true)}
            style={{
              padding: "7px 20px", borderRadius: "8px",
              background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
              color: "#f87171", fontSize: "12px", fontWeight: 600,
              cursor: "pointer", fontFamily: "Inter, sans-serif", width: "140px",
            }}
          >
            Delete Forever
          </button>
        ) : (
          <div style={{ display: "flex", gap: "6px" }}>
            <button
              onClick={onDeleteForever}
              style={{
                padding: "6px 14px", borderRadius: "7px",
                background: "#ef4444", border: "none",
                color: "white", fontSize: "11px", fontWeight: 700,
                cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}
            >
              Confirm
            </button>
            <button
              onClick={() => setConfirmPerm(false)}
              style={{
                padding: "6px 10px", borderRadius: "7px",
                background: "transparent", border: "1px solid #374151",
                color: "#9ca3af", fontSize: "11px",
                cursor: "pointer", fontFamily: "Inter, sans-serif",
              }}
            >
              Cancel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────â”€

type ViewMode = "recent" | "starred" | "all" | "trash";

const VIEW_META: Record<ViewMode, { title: string; subtitle: (n: number) => string; emptyIcon: string; emptyMsg: string }> = {
  recent: { title: "Recent", subtitle: (n) => `${n} map${n !== 1 ? "s" : ""} edited in the last 24h`, emptyIcon: "🕐", emptyMsg: "No maps edited in the last 24 hours" },
  starred: { title: "Starred", subtitle: (n) => `${n} starred map${n !== 1 ? "s" : ""}`, emptyIcon: "⭐", emptyMsg: "No starred maps yet" },
  all: { title: "All Maps", subtitle: (n) => `${n} mind map${n !== 1 ? "s" : ""}`, emptyIcon: "🗺️", emptyMsg: "No mind maps yet" },
  trash: { title: "Trash", subtitle: (n) => `${n} deleted map${n !== 1 ? "s" : ""}`, emptyIcon: "🗑️", emptyMsg: "Trash is empty" },
};

export default function DashboardPage({ view = "all" }: { view?: ViewMode }) {
  const navigate = useNavigate();
  const {
    maps, trashedMaps,
    loadMaps, loadTrash, createMap,
    deleteMap, toggleStar,
    restoreMap, permanentlyDeleteMap,
  } = useMapsStore();
  const [displayMode, setDisplayMode] = useState<"grid" | "list">("grid");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (view === "trash") loadTrash();
    else loadMaps();
    setSearch("");            // clear search when switching tabs
  }, [view]);

  const handleCreate = async () => {
    const map = await createMap();
    navigate(`/editor/${map._id}`);
  };

  // ─── View-based filtering ──────────────────────────────────────────────────
  const ONE_DAY = 24 * 60 * 60 * 1000;
  const baseList: typeof maps = view === "trash" ? trashedMaps : (() => {
    switch (view) {
      case "recent": return maps.filter((m) => Date.now() - new Date(m.updatedAt).getTime() <= ONE_DAY);
      case "starred": return maps.filter((m) => m.isStarred);
      default: return maps;
    }
  })();

  const filtered = baseList.filter((m) =>
    m.title.toLowerCase().includes(search.toLowerCase())
  );

  // Starred float to top for non-trash views
  const displayList = view === "trash" ? filtered : [
    ...filtered.filter((m) => m.isStarred),
    ...filtered.filter((m) => !m.isStarred),
  ];

  const meta = VIEW_META[view];
  const isTrash = view === "trash";

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f172a", fontFamily: "Inter, sans-serif" }}>
      <Sidebar />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        {/* Top bar */}
        <div style={{ padding: "20px 28px 0", borderBottom: "1px solid #1f2937" }}>
          <Topbar onNewMap={isTrash ? undefined : handleCreate} />
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: "auto", padding: "28px" }}>

          <TemplateGallery view={view} />

          {/* Heading + controls row */}
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "24px", gap: "16px", flexWrap: "wrap" }}>
            <div>
              <h1 style={{ margin: 0, fontSize: "22px", fontWeight: 700, color: "white", letterSpacing: "-0.3px" }}>
                {meta.title}
              </h1>
              <p style={{ margin: "4px 0 0", color: "#6b7280", fontSize: "13px" }}>
                {meta.subtitle(displayList.length)}
              </p>
            </div>

            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              {/* Search */}
              <div style={{ position: "relative" }}>
                <svg
                  style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
                  width="12" height="12" fill="none" stroke="#6b7280" strokeWidth="2" viewBox="0 0 24 24"
                >
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  placeholder="Search maps..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{
                    padding: "7px 12px 7px 30px",
                    background: "#1f2937", border: "1px solid #374151",
                    borderRadius: "8px", color: "white", fontSize: "12px",
                    fontFamily: "Inter, sans-serif", outline: "none", width: "170px",
                  }}
                />
              </div>

              {/* Grid / List toggle */}
              <div style={{ display: "flex", gap: "4px", background: "#1f2937", borderRadius: "8px", padding: "3px" }}>
                {(["grid", "list"] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setDisplayMode(mode)}
                    style={{
                      padding: "5px 8px", borderRadius: "6px", border: "none", cursor: "pointer",
                      background: displayMode === mode ? "#374151" : "transparent",
                      color: displayMode === mode ? "white" : "#6b7280",
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

              {/* New Map button â€” hidden in trash */}
              {!isTrash && (
                <button
                  onClick={handleCreate}
                  style={{
                    padding: "7px 14px", borderRadius: "8px",
                    background: "#2563eb", color: "white",
                    border: "none", cursor: "pointer",
                    fontSize: "12px", fontWeight: 600,
                    display: "flex", alignItems: "center", gap: "6px",
                    transition: "background 0.15s", fontFamily: "Inter, sans-serif",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2563eb"; }}
                >
                  <span style={{ fontSize: "16px", lineHeight: 1 }}>+</span> New Map
                </button>
              )}
            </div>
          </div>

          {/* Trash notice banner */}
          {isTrash && (
            <div style={{
              marginBottom: "20px", padding: "10px 16px",
              background: "rgba(239,68,68,0.07)", border: "1px solid rgba(239,68,68,0.2)",
              borderRadius: "10px", color: "#fca5a5", fontSize: "12px",
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              Items in Trash are permanently deleted after 30 days.
            </div>
          )}

          {/* Empty state */}
          {displayList.length === 0 && (
            <div style={{
              display: "flex", flexDirection: "column", alignItems: "center",
              justifyContent: "center", gap: "16px",
              height: "320px",
            }}>
              <span style={{ fontSize: "48px" }}>{meta.emptyIcon}</span>
              <div style={{ fontSize: "15px", color: "#6b7280", fontWeight: 500 }}>
                {search ? `No maps matching "${search}"` : meta.emptyMsg}
              </div>
              {!search && !isTrash && (
                <button
                  onClick={handleCreate}
                  style={{
                    padding: "9px 20px", borderRadius: "8px",
                    background: "#2563eb", color: "white",
                    border: "none", cursor: "pointer",
                    fontSize: "13px", fontWeight: 600,
                    fontFamily: "Inter, sans-serif",
                  }}
                >
                  Create your first map
                </button>
              )}
            </div>
          )}

          {/* Grid view */}
          {displayMode === "grid" && displayList.length > 0 && (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "16px",
            }}>
              {isTrash
                ? displayList.map((map) => (
                  <TrashCard
                    key={map._id}
                    map={map}
                    onRestore={() => restoreMap(map._id)}
                    onDeleteForever={() => permanentlyDeleteMap(map._id)}
                  />
                ))
                : displayList.map((map) => (
                  <MapCard
                    key={map._id}
                    map={map}
                    onOpen={() => navigate(`/editor/${map._id}`)}
                    onDelete={() => deleteMap(map._id)}
                    onToggleStar={() => toggleStar(map._id)}
                  />
                ))
              }
            </div>
          )}

          {/* List view */}
          {displayMode === "list" && displayList.length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {displayList.map((map) => (
                <div
                  key={map._id}
                  style={{
                    display: "flex", alignItems: "center",
                    padding: "12px 16px", gap: "12px",
                    background: "#1e293b", border: "1px solid #1f2937",
                    borderRadius: "10px", transition: "border-color 0.15s", cursor: "default",
                  }}
                  onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#334155"; }}
                  onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.borderColor = "#1f2937"; }}
                >
                  <div style={{
                    width: "36px", height: "36px", borderRadius: "8px",
                    background: "#0f172a", flexShrink: 0,
                    display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px",
                  }}>
                    {isTrash ? "🗑️" : "🗂️"}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: "white", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {map.title}
                    </div>
                    <div style={{ color: "#6b7280", fontSize: "11px", marginTop: "2px" }}>
                      {isTrash ? `Deleted ${relativeTime(map.deletedAt!)}` : `Edited ${relativeTime(map.updatedAt)}`}
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "6px", flexShrink: 0 }}>
                    {isTrash ? (
                      <>
                        <button
                          onClick={() => restoreMap(map._id)}
                          style={{
                            padding: "5px 12px", borderRadius: "6px",
                            background: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.3)",
                            color: "#34d399", fontSize: "11px", fontWeight: 600,
                            cursor: "pointer", fontFamily: "Inter, sans-serif",
                          }}
                        >
                          Restore
                        </button>
                        <button
                          onClick={() => {
                            if (window.confirm(`Permanently delete "${map.title}"? This cannot be undone.`)) {
                              permanentlyDeleteMap(map._id);
                            }
                          }}
                          style={{
                            padding: "5px 10px", borderRadius: "6px",
                            background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                            color: "#f87171", fontSize: "11px",
                            cursor: "pointer", fontFamily: "Inter, sans-serif",
                          }}
                        >
                          Delete Forever
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => toggleStar(map._id)}
                          style={{ background: "none", border: "none", color: map.isStarred ? "#f59e0b" : "#4b5563", cursor: "pointer", padding: "4px" }}
                        >
                          <svg width="14" height="14" fill={map.isStarred ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                          </svg>
                        </button>
                        <button
                          onClick={() => navigate(`/editor/${map._id}`)}
                          style={{
                            padding: "5px 12px", borderRadius: "6px",
                            background: "#1f2937", border: "1px solid #374151",
                            color: "white", fontSize: "11px", fontWeight: 600,
                            cursor: "pointer", fontFamily: "Inter, sans-serif",
                          }}
                        >
                          Open
                        </button>
                        <button
                          onClick={() => deleteMap(map._id)}
                          style={{
                            padding: "5px 8px", borderRadius: "6px",
                            background: "transparent", border: "1px solid transparent",
                            color: "#6b7280", fontSize: "11px", cursor: "pointer",
                            transition: "color 0.15s, border-color 0.15s",
                          }}
                          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#f87171"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.3)"; }}
                          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6b7280"; (e.currentTarget as HTMLButtonElement).style.borderColor = "transparent"; }}
                        >
                          <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6M14 11v6M9 6V4h6v2" />
                          </svg>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
