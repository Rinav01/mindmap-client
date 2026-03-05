import { useState } from "react";
import { useParams } from "react-router-dom";
import { useEditorStore } from "../../store/editorStore";
import ShareModal from "./ShareModal";
import { exportMapJson, exportMapMarkdown, exportMapPng, exportMapPdf } from "../../services/exportService";

const iconBtn = (active = false, disabled = false) => ({
    background: active ? "#1e3a5f" : "transparent",
    border: "none",
    borderRadius: "7px",
    cursor: disabled ? "not-allowed" : "pointer",
    color: active ? "#60a5fa" : disabled ? "#4b5563" : "#9ca3af",
    padding: "7px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background 0.15s, color 0.15s",
    opacity: disabled ? 0.45 : 1,
} as React.CSSProperties);

interface EditorHeaderProps {
    onAddNode?: () => void;
    onToggleHistory?: () => void;
    isHistoryOpen?: boolean;
    onToggleActivity?: () => void;
    isActivityOpen?: boolean;
}

export default function EditorHeader({ onAddNode, onToggleHistory, isHistoryOpen, onToggleActivity, isActivityOpen }: EditorHeaderProps) {
    const { id } = useParams();
    // ...
    const undo = useEditorStore((s) => s.undo);
    const redo = useEditorStore((s) => s.redo);
    const zoom = useEditorStore((s) => s.zoom);
    const autoLayout = useEditorStore((s) => s.autoLayout);
    const mapTitle = useEditorStore((s) => s.mapTitle);
    const setMapTitle = useEditorStore((s) => s.setMapTitle);
    const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds);
    const isPanMode = useEditorStore((s) => s.isPanMode);
    const setIsPanMode = useEditorStore((s) => s.setIsPanMode);
    const currentUserRole = useEditorStore((s) => s.currentUserRole);

    const isViewer = currentUserRole === "VIEWER";

    const [editingTitle, setEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState("");
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);

    const handleTitleClick = () => {
        if (isViewer) return;
        setTitleDraft(mapTitle);
        setEditingTitle(true);
    };

    const handleTitleSave = () => {
        const trimmed = titleDraft.trim();
        if (trimmed && trimmed !== mapTitle && id) {
            setMapTitle(id, trimmed);
        }
        setEditingTitle(false);
    };

    // Disable adding node if 0 or >1 nodes selected (for now, simplify to single parent add)
    // Actually we could support multi-add but let's stick to single parent for safety first.
    const addNodeDisabled = selectedNodeIds.size !== 1;

    return (
        <header style={{
            position: "fixed", top: 0, left: 0, right: 0, height: "52px",
            background: "#111827",
            borderBottom: "1px solid #1f2937",
            display: "flex", alignItems: "center",
            padding: "0 16px", zIndex: 50, gap: "12px",
            fontFamily: "Inter, sans-serif",
        }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <div style={{
                    width: "28px", height: "28px",
                    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
                    borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                    <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                    </svg>
                </div>
                <span style={{ color: "white", fontWeight: 700, fontSize: "14px" }}>MindFlow</span>
                <span style={{
                    fontSize: "10px", fontWeight: 700, color: "#60a5fa",
                    background: "#1e3a5f", padding: "2px 5px", borderRadius: "4px", letterSpacing: "0.05em",
                }}>PRO</span>
            </div>

            {/* Divider */}
            <div style={{ width: "1px", height: "24px", background: "#1f2937", flexShrink: 0 }} />

            {/* Editable Map Title */}
            {editingTitle ? (
                <input
                    autoFocus
                    value={titleDraft}
                    onChange={(e) => setTitleDraft(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={(e) => {
                        if (e.key === "Enter") handleTitleSave();
                        if (e.key === "Escape") setEditingTitle(false);
                    }}
                    style={{
                        background: "#1f2937", border: "1px solid #3b82f6",
                        borderRadius: "6px", color: "white",
                        fontSize: "13px", fontWeight: 600,
                        padding: "4px 8px", outline: "none",
                        fontFamily: "Inter, sans-serif",
                        width: "180px",
                    }}
                />
            ) : (
                <button
                    onClick={handleTitleClick}
                    title="Click to rename"
                    style={{
                        background: "transparent", border: "none", cursor: "text",
                        color: "#e2e8f0", fontSize: "13px", fontWeight: 600,
                        fontFamily: "Inter, sans-serif", padding: "4px 6px",
                        borderRadius: "6px", maxWidth: "200px",
                        overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                        transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
                >
                    {mapTitle || "Untitled Map"}
                </button>
            )}

            {/* Divider */}
            <div style={{ width: "1px", height: "24px", background: "#1f2937", flexShrink: 0 }} />

            {/* Toolbar icons */}
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
                {/* Cursor — Select Mode */}
                <button
                    style={iconBtn(!isPanMode)}
                    title="Select mode (default)"
                    onClick={() => setIsPanMode(false)}
                >
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                        <path d="M13 13l6 6" />
                    </svg>
                </button>

                {/* Hand — Pan Mode */}
                <button
                    style={iconBtn(isPanMode)}
                    title="Pan mode"
                    onClick={() => setIsPanMode(true)}
                >
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                    </svg>
                </button>

                {/* Editor Action Buttons */}
                {!isViewer && (
                    <>
                        {/* Add Node */}
                        <button
                            style={iconBtn(false, addNodeDisabled)}
                            title={addNodeDisabled ? "Select a node first" : "Add node"}
                            onClick={addNodeDisabled ? undefined : onAddNode}
                            onMouseEnter={(e) => { if (!addNodeDisabled) { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; (e.currentTarget as HTMLButtonElement).style.color = "white"; } }}
                            onMouseLeave={(e) => { if (!addNodeDisabled) { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; } }}
                        >
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect x="3" y="3" width="18" height="18" rx="3" />
                                <line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                            </svg>
                        </button>

                        {/* Auto Layout */}
                        <button
                            style={iconBtn()}
                            title="Auto Layout"
                            onClick={autoLayout}
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }
                            }
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }
                            }
                        >
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <rect x="9" y="2" width="6" height="4" rx="1" />
                                <rect x="2" y="18" width="6" height="4" rx="1" />
                                <rect x="16" y="18" width="6" height="4" rx="1" />
                                <line x1="12" y1="6" x2="12" y2="12" />
                                <line x1="12" y1="12" x2="5" y2="18" />
                                <line x1="12" y1="12" x2="19" y2="18" />
                            </svg>
                        </button>

                        {/* Divider */}
                        <div style={{ width: "1px", height: "20px", background: "#1f2937", margin: "0 4px" }} />

                        {/* Divider */}
                        <div style={{ width: "1px", height: "16px", background: "#334155", margin: "0 6px" }}></div>

                        {/* Undo */}
                        <button
                            style={iconBtn()}
                            onClick={undo}
                            title="Undo (Ctrl+Z)"
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }
                            }
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }
                            }
                        >
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="9 14 4 9 9 4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                            </svg>
                        </button>

                        {/* Redo */}
                        <button
                            style={iconBtn()}
                            onClick={redo}
                            title="Redo (Ctrl+Y)"
                            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }
                            }
                            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }
                            }
                        >
                            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="15 14 20 9 15 4" /><path d="M4 20v-7a4 4 0 0 1 4-4h12" />
                            </svg>
                        </button>
                        {/* Divider inside toolbar */}
                        <div style={{ width: "1px", height: "24px", background: "#1f2937", flexShrink: 0, marginLeft: 2, marginRight: 2 }} />
                    </>
                )}

                {/* Activity Log */}
                <button
                    style={{
                        ...iconBtn(isActivityOpen),
                        color: isActivityOpen ? "#38bdf8" : "#94a3b8"
                    }}
                    title="Activity Log"
                    onClick={onToggleActivity}
                >
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                    </svg>
                </button>

                {/* History/Snapshots */}
                <button
                    style={iconBtn(isHistoryOpen)}
                    onClick={onToggleHistory}
                    title="History & Snapshots"
                    onMouseEnter={(e) => { if (!isHistoryOpen) { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; (e.currentTarget as HTMLButtonElement).style.color = "white"; } }}
                    onMouseLeave={(e) => { if (!isHistoryOpen) { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; } }}
                >
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M12 8v4l3 3" />
                        <circle cx="12" cy="12" r="9" />
                        <path d="M3.3 7a9 9 0 1 1 0 10" />
                    </svg>
                </button>
            </div>

            {/* Spacer */}
            <div style={{ flex: 1 }} />

            {/* Zoom display */}
            <div style={{
                display: "flex", alignItems: "center", gap: "6px",
                background: "#1f2937", borderRadius: "8px", padding: "5px 10px",
                color: "#9ca3af", fontSize: "13px", fontWeight: 500, flexShrink: 0,
            }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {Math.round(zoom * 100)}%
            </div>

            {/* Export Menu Container */}
            <div style={{ position: "relative" }}>
                <button
                    onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
                    style={{
                        display: "flex", alignItems: "center", gap: "6px",
                        padding: "7px 14px", borderRadius: "8px", flexShrink: 0,
                        background: isExportMenuOpen ? "#1d4ed8" : "#2563eb", border: "none", cursor: "pointer",
                        color: "white", fontSize: "13px", fontWeight: 600,
                        fontFamily: "Inter, sans-serif", transition: "background 0.15s",
                    }}
                    onMouseEnter={(e) => { if (!isExportMenuOpen) (e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8"; }}
                    onMouseLeave={(e) => { if (!isExportMenuOpen) (e.currentTarget as HTMLButtonElement).style.background = "#2563eb"; }}
                >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                    </svg>
                    Export
                    <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ marginLeft: "2px", transition: "transform 0.2s", transform: isExportMenuOpen ? "rotate(180deg)" : "rotate(0deg)" }}>
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>

                {/* Export Dropdown */}
                {isExportMenuOpen && (
                    <>
                        <div style={{ position: "fixed", inset: 0, zIndex: 60 }} onClick={() => setIsExportMenuOpen(false)} />
                        <div style={{
                            position: "absolute", top: "calc(100% + 8px)", right: 0,
                            background: "#1e293b", border: "1px solid #334155",
                            borderRadius: "8px", padding: "6px", minWidth: "160px",
                            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)", zIndex: 65,
                            display: "flex", flexDirection: "column", gap: "2px"
                        }}>
                            {[
                                { label: "PNG Image", action: () => { exportMapPng(mapTitle); }, icon: <polygon points="19 21 5 21 5 3 13 3 19 9 19 21" /> },
                                { label: "PDF Document", action: () => { exportMapPdf(mapTitle); }, icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> },
                                { label: "JSON Data", action: () => { if (id) exportMapJson(id); }, icon: <polyline points="16 18 22 12 16 6" /> },
                                { label: "Markdown Text", action: () => { if (id) exportMapMarkdown(id); }, icon: <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /> },
                            ].map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => { opt.action(); setIsExportMenuOpen(false); }}
                                    style={{
                                        width: "100%", padding: "8px 10px", background: "transparent", border: "none",
                                        borderRadius: "6px", cursor: "pointer", color: "#d1d5db",
                                        fontSize: "13px", fontWeight: 500, fontFamily: "Inter, sans-serif",
                                        display: "flex", alignItems: "center", gap: "8px", textAlign: "left",
                                        transition: "background 0.15s, color 0.15s"
                                    }}
                                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#3b82f6"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
                                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#d1d5db"; }}
                                >
                                    <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        {opt.icon}
                                    </svg>
                                    {opt.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* Share */}
            <button style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "8px", flexShrink: 0,
                background: "#10b981", border: "none", cursor: "pointer",
                color: "white", fontSize: "13px", fontWeight: 600,
                fontFamily: "Inter, sans-serif", transition: "background 0.15s",
            }}
                title="Share this map to see live cursors!"
                onClick={() => setIsShareModalOpen(true)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#059669"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#10b981"; }}
            >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Share
            </button>

            {/* Share Modal */}
            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />

            {/* Live Presence Avatars */}
            <PresenceAvatars />
        </header>
    );
}

function PresenceAvatars() {
    const onlineUsers = useEditorStore((s) => s.onlineUsers);
    const entries = Object.entries(onlineUsers);
    const maxVisible = 5;
    const visible = entries.slice(0, maxVisible);
    const overflow = entries.length - maxVisible;

    if (entries.length === 0) return null;

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "4px", flexShrink: 0 }}>
            {/* Online count badge */}
            <div style={{
                display: "flex", alignItems: "center", gap: "4px",
                padding: "3px 8px", borderRadius: "10px",
                background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)",
                fontSize: "11px", fontWeight: 600, color: "#34d399",
                fontFamily: "Inter, sans-serif",
            }}>
                <span style={{
                    width: "6px", height: "6px", borderRadius: "50%",
                    background: "#10b981", display: "inline-block",
                    boxShadow: "0 0 6px rgba(16,185,129,0.8)",
                }} />
                {entries.length}
            </div>

            {/* Overlapping avatars */}
            <div style={{ display: "flex", flexDirection: "row-reverse" }}>
                {overflow > 0 && (
                    <div style={{
                        width: "28px", height: "28px", borderRadius: "50%",
                        background: "#334155", border: "2px solid #0f172a",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "#94a3b8", fontSize: "10px", fontWeight: 700,
                        marginLeft: "-8px", zIndex: 0,
                        fontFamily: "Inter, sans-serif",
                    }}>
                        +{overflow}
                    </div>
                )}
                {[...visible].reverse().map(([sid, user], i) => (
                    <div
                        key={sid}
                        title={user.name}
                        style={{
                            width: "28px", height: "28px", borderRadius: "50%",
                            background: user.color,
                            border: "2px solid #0f172a",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontSize: "11px", fontWeight: 700,
                            marginLeft: i > 0 ? "-8px" : "0",
                            zIndex: maxVisible - i,
                            cursor: "pointer",
                            transition: "transform 0.15s",
                            fontFamily: "Inter, sans-serif",
                        }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1.15)"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = "scale(1)"; }}
                    >
                        {user.name.charAt(0).toUpperCase()}
                    </div>
                ))}
            </div>
        </div>
    );
}
