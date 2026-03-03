import { useEditorStore } from "../../store/editorStore";
import type { MindMapVersion } from "../../store/editorStore";
import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";

interface Props {
    onClose: () => void;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function relativeTime(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 30) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString();
}

const ACTION_CONFIG: Record<string, { label: string; color: string; bg: string; icon: string }> = {
    "manual": { label: "Snapshot", color: "#60a5fa", bg: "rgba(59,130,246,0.12)", icon: "📸" },
    "auto-layout": { label: "Auto Layout", color: "#a78bfa", bg: "rgba(139,92,246,0.12)", icon: "⚡" },
    "restore": { label: "Restored", color: "#34d399", bg: "rgba(52,211,153,0.12)", icon: "🔄" },
    "align": { label: "Aligned", color: "#94a3b8", bg: "rgba(148,163,184,0.10)", icon: "↔️" },
    "delete": { label: "Deleted", color: "#f87171", bg: "rgba(248,113,113,0.10)", icon: "🗑️" },
};
const DEFAULT_ACTION = { label: "Snapshot", color: "#60a5fa", bg: "rgba(59,130,246,0.12)", icon: "📸" };

// ─── Sub-components ──────────────────────────────────────────────────────────

function ActionBadge({ type }: { type: string }) {
    const cfg = ACTION_CONFIG[type] ?? DEFAULT_ACTION;
    return (
        <span style={{
            fontSize: "10px", fontWeight: 700, letterSpacing: "0.06em",
            padding: "2px 7px", borderRadius: "99px",
            color: cfg.color, background: cfg.bg,
            whiteSpace: "nowrap",
        }}>
            {cfg.label.toUpperCase()}
        </span>
    );
}

function TimelineEntry({
    version,
    isFirst,
    isLast,
    isCurrent,
    onRestore,
    onDelete,
}: {
    version: MindMapVersion;
    isFirst: boolean;
    isLast: boolean;
    isCurrent: boolean;
    onRestore: () => void;
    onDelete: () => void;
}) {
    const [hovered, setHovered] = useState(false);
    const cfg = ACTION_CONFIG[version.actionType] ?? DEFAULT_ACTION;
    const displayName = version.label || "Unnamed Snapshot";

    return (
        <div
            style={{ display: "flex", gap: "0", position: "relative" }}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            {/* Timeline gutter: line + dot */}
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: "32px", flexShrink: 0, paddingTop: "4px" }}>
                {/* Line segment above dot */}
                <div style={{
                    width: "2px",
                    height: isFirst ? "12px" : "16px",
                    background: isFirst ? "transparent" : "#1f2937",
                    flexShrink: 0,
                }} />
                {/* Dot */}
                <div style={{
                    width: isCurrent ? "14px" : "10px",
                    height: isCurrent ? "14px" : "10px",
                    borderRadius: "50%",
                    background: isCurrent ? cfg.color : "#334155",
                    border: `2px solid ${isCurrent ? cfg.color : "#475569"}`,
                    boxShadow: isCurrent ? `0 0 8px ${cfg.color}88` : "none",
                    flexShrink: 0,
                    transition: "all 0.2s ease",
                    position: "relative",
                    zIndex: 1,
                }}>
                    {/* Pulsing ring for current */}
                    {isCurrent && (
                        <div style={{
                            position: "absolute", inset: "-5px",
                            border: `1px solid ${cfg.color}55`,
                            borderRadius: "50%",
                            animation: "pulse-ring 2s ease-out infinite",
                        }} />
                    )}
                </div>
                {/* Line segment below dot */}
                <div style={{
                    width: "2px",
                    flex: 1,
                    minHeight: "16px",
                    background: isLast ? "transparent" : "#1f2937",
                }} />
            </div>

            {/* Content card */}
            <div style={{
                flex: 1,
                marginBottom: "4px",
                marginLeft: "6px",
                padding: "10px 12px",
                background: isCurrent
                    ? `linear-gradient(135deg, ${cfg.bg}, rgba(15,23,42,0.5))`
                    : hovered ? "#1e293b" : "transparent",
                border: `1px solid ${isCurrent ? cfg.color + "44" : hovered ? "#334155" : "transparent"}`,
                borderRadius: "10px",
                transition: "all 0.15s ease",
                cursor: "default",
            }}>
                {/* Top row: name + badge */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", minWidth: 0 }}>
                        <span style={{ fontSize: "12px" }}>{cfg.icon}</span>
                        <span style={{
                            fontSize: "13px", fontWeight: 600,
                            color: isCurrent ? "white" : "#e2e8f0",
                            whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                            maxWidth: "115px",
                        }} title={displayName}>
                            {displayName}
                        </span>
                    </div>
                    <ActionBadge type={version.actionType} />
                </div>

                {/* Timestamp & Author */}
                <div style={{ marginTop: "6px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {version.createdBy && version.createdBy.username ? (
                            <div
                                title={`Saved by ${version.createdBy.username}`}
                                style={{
                                    width: "16px", height: "16px", borderRadius: "50%",
                                    background: version.createdBy.color || "#3b82f6",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "white", fontSize: "9px", fontWeight: 700,
                                }}
                            >
                                {version.createdBy.username.charAt(0).toUpperCase()}
                            </div>
                        ) : null}
                        <span
                            style={{ fontSize: "11px", color: "#6b7280", cursor: "default" }}
                            title={new Date(version.createdAt).toLocaleString()}
                        >
                            {relativeTime(version.createdAt)}
                        </span>
                    </div>
                    {isCurrent && (
                        <span style={{ fontSize: "10px", fontWeight: 700, color: cfg.color, letterSpacing: "0.05em" }}>
                            ● CURRENT
                        </span>
                    )}
                </div>

                {/* Action buttons — visible on hover */}
                {(
                    <div style={{
                        overflow: "hidden",
                        maxHeight: hovered ? "40px" : "0",
                        opacity: hovered ? 1 : 0,
                        transition: "max-height 0.2s ease, opacity 0.15s ease",
                        marginTop: hovered ? "8px" : "0",
                        display: "flex",
                        gap: "6px",
                    }}>
                        {!isCurrent && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onRestore(); }}
                                style={{
                                    flex: 1, padding: "6px",
                                    borderRadius: "6px",
                                    background: "rgba(59,130,246,0.1)",
                                    border: "1px solid rgba(59,130,246,0.25)",
                                    color: "#60a5fa", fontSize: "11px", fontWeight: 700,
                                    cursor: "pointer", fontFamily: "Inter, sans-serif",
                                    letterSpacing: "0.05em",
                                    transition: "background 0.15s, border-color 0.15s",
                                }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.2)";
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = "#3b82f6";
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.1)";
                                    (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(59,130,246,0.25)";
                                }}
                            >
                                RESTORE
                            </button>
                        )}
                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(); }}
                            title="Delete this snapshot"
                            style={{
                                padding: "6px 10px",
                                borderRadius: "6px",
                                background: "rgba(239,68,68,0.08)",
                                border: "1px solid rgba(239,68,68,0.2)",
                                color: "#f87171", fontSize: "13px",
                                cursor: "pointer", fontFamily: "Inter, sans-serif",
                                transition: "background 0.15s, border-color 0.15s",
                                lineHeight: 1,
                                flexShrink: 0,
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.18)";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef4444";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.08)";
                                (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.2)";
                            }}
                        >
                            🗑
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── Main Panel ──────────────────────────────────────────────────────────────

export default function VersionPanel({ onClose }: Props) {
    const { id: mindMapId } = useParams();
    const versions = useEditorStore((s) => s.versions);
    const currentVersionId = useEditorStore((s) => s.currentVersionId);
    const loadVersions = useEditorStore((s) => s.loadVersions);
    const createSnapshot = useEditorStore((s) => s.createSnapshot);
    const restoreVersion = useEditorStore((s) => s.restoreVersion);

    const deleteVersion = useEditorStore((s) => s.deleteVersion);

    const [newSnapshotName, setNewSnapshotName] = useState("");
    const [isCreating, setIsCreating] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (mindMapId) loadVersions(mindMapId);
    }, [mindMapId, loadVersions]);

    const handleCreateSnapshot = async () => {
        if (!mindMapId || !newSnapshotName.trim()) return;
        setIsCreating(true);
        await createSnapshot(mindMapId, newSnapshotName.trim());
        setNewSnapshotName("");
        setIsCreating(false);
    };

    const handleRestore = (version: MindMapVersion) => {
        if (!mindMapId) return;
        if (window.confirm(`Restore to "${version.label || "this snapshot"}"?\nThis will overwrite your current map state.`)) {
            restoreVersion(mindMapId, version._id);
        }
    };

    const handleDelete = (version: MindMapVersion) => {
        if (!mindMapId) return;
        if (window.confirm(`Delete snapshot "${version.label || "this snapshot"}"? This cannot be undone.`)) {
            deleteVersion(mindMapId, version._id);
        }
    };

    // newest first
    const sortedVersions = [...versions].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return (
        <div style={{
            position: "fixed", top: 0, right: 0, height: "100%", width: "300px",
            background: "#0d1117",
            borderLeft: "1px solid #1f2937",
            zIndex: 60,
            display: "flex",
            flexDirection: "column",
            fontFamily: "Inter, sans-serif",
            boxShadow: "-12px 0 40px rgba(0,0,0,0.6)",
        }}>
            <style>{`
                @keyframes pulse-ring {
                    0%   { transform: scale(1); opacity: 0.7; }
                    100% { transform: scale(2.2); opacity: 0; }
                }
            `}</style>

            {/* ── Header ── */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "16px 16px 14px",
                borderBottom: "1px solid #1f2937",
                flexShrink: 0,
            }}>
                <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: "white" }}>Version History</div>
                    <div style={{ fontSize: "11px", color: "#4b5563", marginTop: "2px" }}>
                        {versions.length} snapshot{versions.length !== 1 ? "s" : ""}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#6b7280", fontSize: "20px", lineHeight: 1,
                        padding: "4px", borderRadius: "6px",
                        transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6b7280"; }}
                >
                    ×
                </button>
            </div>

            {/* ── Save Snapshot ── */}
            <div style={{ padding: "14px 16px", borderBottom: "1px solid #1f2937", flexShrink: 0 }}>
                <div style={{ display: "flex", gap: "8px" }}>
                    <input
                        ref={inputRef}
                        placeholder="Name this snapshot..."
                        value={newSnapshotName}
                        onChange={(e) => setNewSnapshotName(e.target.value)}
                        onKeyDown={(e) => { if (e.key === "Enter") handleCreateSnapshot(); }}
                        style={{
                            flex: 1, padding: "9px 12px",
                            background: "#161b22", border: "1px solid #30363d",
                            borderRadius: "8px", color: "white", fontSize: "12px",
                            fontFamily: "Inter, sans-serif", outline: "none",
                        }}
                    />
                    <button
                        onClick={handleCreateSnapshot}
                        disabled={isCreating || !newSnapshotName.trim()}
                        style={{
                            padding: "0 14px", borderRadius: "8px",
                            background: newSnapshotName.trim() ? "#2563eb" : "#1e293b",
                            color: newSnapshotName.trim() ? "white" : "#4b5563",
                            border: "none", cursor: newSnapshotName.trim() ? "pointer" : "default",
                            fontSize: "12px", fontWeight: 700,
                            transition: "background 0.15s",
                            whiteSpace: "nowrap",
                        }}
                    >
                        {isCreating ? "..." : "Save"}
                    </button>
                </div>
            </div>

            {/* ── Timeline ── */}
            <div style={{ flex: 1, overflowY: "auto", padding: "12px 10px 24px" }}>
                {sortedVersions.length === 0 ? (
                    <div style={{
                        display: "flex", flexDirection: "column", alignItems: "center",
                        justifyContent: "center", gap: "12px",
                        height: "200px", color: "#374151",
                    }}>
                        <span style={{ fontSize: "32px" }}>📭</span>
                        <div style={{ fontSize: "13px", color: "#4b5563" }}>No snapshots yet.</div>
                        <div style={{ fontSize: "11px", color: "#374151" }}>Name and save your current state above.</div>
                    </div>
                ) : (
                    <div>
                        {sortedVersions.map((v, i) => (
                            <TimelineEntry
                                key={v._id}
                                version={v}
                                isFirst={i === 0}
                                isLast={i === sortedVersions.length - 1}
                                isCurrent={v._id === currentVersionId}
                                onRestore={() => handleRestore(v)}
                                onDelete={() => handleDelete(v)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
