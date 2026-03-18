import { useState } from "react";
import { useParams } from "react-router-dom";
import { useEditorStore } from "../../store/editorStore";
import ShareModal from "./ShareModal";
import AiGenerateModal from "./AiGenerateModal";
import ExportMenu from "./ExportMenu";
import PresenceAvatars from "./PresenceAvatars";
import { useSyncStore } from "../../store/useSyncStore";

// ─── Shared style helper ───────────────────────────────────────────────────────

const iconBtn = (active = false, disabled = false): React.CSSProperties => ({
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
});

const Divider = ({ thin }: { thin?: boolean }) => (
    <div style={{ width: "1px", height: thin ? "20px" : "24px", background: thin ? "#334155" : "#1f2937", flexShrink: 0, margin: "0 4px" }} />
);

// ─── Sub-component: editable map title ────────────────────────────────────────

function MapTitleInput() {
    const { id } = useParams();
    const mapTitle = useEditorStore((s) => s.mapTitle);
    const setMapTitle = useEditorStore((s) => s.setMapTitle);
    const currentUserRole = useEditorStore((s) => s.currentUserRole);
    const isViewer = currentUserRole === "VIEWER";

    const [editing, setEditing] = useState(false);
    const [draft, setDraft] = useState("");

    const handleClick = () => { if (isViewer) return; setDraft(mapTitle); setEditing(true); };
    const handleSave = () => {
        const trimmed = draft.trim();
        if (trimmed && trimmed !== mapTitle && id) setMapTitle(id, trimmed);
        setEditing(false);
    };

    if (editing) {
        return (
            <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={handleSave}
                onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false); }}
                style={{
                    background: "#1f2937", border: "1px solid #3b82f6",
                    borderRadius: "6px", color: "white",
                    fontSize: "13px", fontWeight: 600,
                    padding: "4px 8px", outline: "none",
                    fontFamily: "Inter, sans-serif", width: "180px",
                }}
            />
        );
    }

    return (
        <button
            onClick={handleClick}
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
    );
}

// ─── Sub-component: toolbar action buttons ────────────────────────────────────

interface EditorToolbarProps {
    onAddNode?: () => void;
    onToggleHistory?: () => void;
    isHistoryOpen?: boolean;
    onToggleActivity?: () => void;
    isActivityOpen?: boolean;
}

function EditorToolbar({ onAddNode, onToggleHistory, isHistoryOpen, onToggleActivity, isActivityOpen }: EditorToolbarProps) {
    const undo = useEditorStore((s) => s.undo);
    const redo = useEditorStore((s) => s.redo);
    const autoLayout = useEditorStore((s) => s.autoLayout);
    const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds);
    const isPanMode = useEditorStore((s) => s.isPanMode);
    const setIsPanMode = useEditorStore((s) => s.setIsPanMode);
    const currentUserRole = useEditorStore((s) => s.currentUserRole);

    const isViewer = currentUserRole === "VIEWER";
    const addDisabled = selectedNodeIds.size !== 1;

    const hover = (e: React.MouseEvent<HTMLButtonElement>, on: boolean) => {
        (e.currentTarget as HTMLButtonElement).style.background = on ? "#1f2937" : "transparent";
        (e.currentTarget as HTMLButtonElement).style.color = on ? "white" : "#9ca3af";
    };

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
            {/* Mode toggle (Pan / Select) */}
            <button
                style={iconBtn(true)}
                title={isPanMode ? "Pan Mode (Click to switch to Select)" : "Select Mode (Click to switch to Pan)"}
                onClick={() => setIsPanMode(!isPanMode)}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "brightness(1.2)"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.filter = "none"; }}
            >
                {isPanMode ? (
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="M18 11V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v0" />
                        <path d="M14 10V4a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v2" />
                        <path d="M10 10.5V6a2 2 0 0 0-2-2v0a2 2 0 0 0-2 2v8" />
                        <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
                    </svg>
                ) : (
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                        <path d="m2 2 7.17 17.52 3.1-7.3 7.3-3.1Z"/>
                        <path d="m13 13 6 6"/>
                    </svg>
                )}
            </button>

            {!isViewer && (
                <>
                    {/* Add node */}
                    <button style={iconBtn(false, addDisabled)} title={addDisabled ? "Select a node first" : "Add node"}
                        onClick={addDisabled ? undefined : onAddNode}
                        onMouseEnter={(e) => { if (!addDisabled) hover(e, true); }}
                        onMouseLeave={(e) => { if (!addDisabled) hover(e, false); }}>
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="3" y="3" width="18" height="18" rx="3" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                        </svg>
                    </button>

                    {/* Auto layout */}
                    <button style={iconBtn()} title="Auto Layout" onClick={autoLayout} onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}>
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <rect x="9" y="2" width="6" height="4" rx="1" /><rect x="2" y="18" width="6" height="4" rx="1" /><rect x="16" y="18" width="6" height="4" rx="1" />
                            <line x1="12" y1="6" x2="12" y2="12" /><line x1="12" y1="12" x2="5" y2="18" /><line x1="12" y1="12" x2="19" y2="18" />
                        </svg>
                    </button>

                    <Divider />

                    {/* Undo */}
                    <button style={iconBtn()} onClick={undo} title="Undo (Ctrl+Z)" onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}>
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="9 14 4 9 9 4" /><path d="M20 20v-7a4 4 0 0 0-4-4H4" />
                        </svg>
                    </button>

                    {/* Redo */}
                    <button style={iconBtn()} onClick={redo} title="Redo (Ctrl+Y)" onMouseEnter={(e) => hover(e, true)} onMouseLeave={(e) => hover(e, false)}>
                        <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <polyline points="15 14 20 9 15 4" /><path d="M4 20v-7a4 4 0 0 1 4-4h12" />
                        </svg>
                    </button>

                    <Divider />
                </>
            )}

            {/* Activity log */}
            <button style={{ ...iconBtn(isActivityOpen), color: isActivityOpen ? "#38bdf8" : "#94a3b8" }}
                title="Activity Log" onClick={onToggleActivity}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                </svg>
            </button>

            {/* History / snapshots */}
            <button id="btn-history" style={iconBtn(isHistoryOpen)} onClick={onToggleHistory} title="History & Snapshots"
                onMouseEnter={(e) => { if (!isHistoryOpen) hover(e, true); }}
                onMouseLeave={(e) => { if (!isHistoryOpen) hover(e, false); }}>
                <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 8v4l3 3" /><circle cx="12" cy="12" r="9" /><path d="M3.3 7a9 9 0 1 1 0 10" />
                </svg>
            </button>
        </div>
    );
}

// ─── Sub-component: Sync Status Indicator ─────────────────────────────────────

function SyncStatusIndicator() {
    const networkStatus = useSyncStore((s) => s.networkStatus);
    const lastSyncTimestamp = useSyncStore((s) => s.lastSyncTimestamp);

    let icon;
    let text;
    let color;

    switch (networkStatus) {
        case "online":
            icon = <circle cx="12" cy="12" r="5" fill="currentColor" />;
            text = "Online";
            color = "#22c55e"; // Green
            break;
        case "syncing":
            icon = (
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                    <path d="M21 12a9 9 0 1 1-9-9c2.52 0 4.93 1 6.74 2.74L21 8" />
                    <path d="M21 3v5h-5" />
                </svg>
            );
            text = "Syncing...";
            color = "#eab308"; // Yellow
            break;
        case "offline":
            icon = (
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="1" y1="1" x2="23" y2="23" />
                    <path d="M16.72 11.06A10.94 10.94 0 0 1 19 12.55" />
                    <path d="M5 12.55a10.94 10.94 0 0 1 5.17-2.39" />
                    <path d="M10.71 5.05A16 16 0 0 1 22.58 9" />
                    <path d="M1.42 9a15.91 15.91 0 0 1 4.7-2.88" />
                    <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
                    <line x1="12" y1="20" x2="12.01" y2="20" />
                </svg>
            );
            text = "Offline Mode";
            color = "#ef4444"; // Red
            break;
        case "idle":
            icon = (
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <polyline points="20 6 9 17 4 12" />
                </svg>
            );
            text = "All changes saved";
            color = "#9ca3af"; // Gray
            break;
    }

    return (
        <div style={{ display: "flex", alignItems: "center", gap: "6px", color, fontSize: "12px", fontWeight: 500, fontFamily: "Inter, sans-serif" }} title={lastSyncTimestamp ? `Last sync: ${new Date(lastSyncTimestamp).toLocaleTimeString()}` : "No sync history"}>
            {icon}
            {text}
        </div>
    );
}

// ─── Main component ────────────────────────────────────────────────────────────

interface EditorHeaderProps {
    onAddNode?: () => void;
    onToggleHistory?: () => void;
    isHistoryOpen?: boolean;
    onToggleActivity?: () => void;
    isActivityOpen?: boolean;
}

export default function EditorHeader(props: EditorHeaderProps) {
    const mapTitle = useEditorStore((s) => s.mapTitle);
    const zoom = useEditorStore((s) => s.zoom);
    const currentUserRole = useEditorStore((s) => s.currentUserRole);
    const isViewer = currentUserRole === "VIEWER";

    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [isAiModalOpen, setIsAiModalOpen] = useState(false);

    return (
        <header style={{
            position: "fixed", top: 0, left: 0, right: 0, height: "52px",
            background: "#111827", borderBottom: "1px solid #1f2937",
            display: "flex", alignItems: "center",
            padding: "0 16px", zIndex: 50, gap: "12px",
            fontFamily: "Inter, sans-serif",
        }}>
            {/* Logo */}
            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg, #3b82f6, #2563eb)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="16" height="16" fill="white" viewBox="0 0 24 24">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                    </svg>
                </div>
                <span style={{ color: "white", fontWeight: 700, fontSize: "14px" }}>MindFlow</span>
                <span style={{ fontSize: "10px", fontWeight: 700, color: "#60a5fa", background: "#1e3a5f", padding: "2px 5px", borderRadius: "4px", letterSpacing: "0.05em" }}>PRO</span>
            </div>

            <Divider />
            <MapTitleInput />
            <Divider />
            <EditorToolbar {...props} />

            <div style={{ flex: 1 }} />

            <SyncStatusIndicator />

            {/* Zoom readout */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px", background: "#1f2937", borderRadius: "8px", padding: "5px 10px", color: "#9ca3af", fontSize: "13px", fontWeight: 500, flexShrink: 0 }}>
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                {Math.round(zoom * 100)}%
            </div>

            <ExportMenu mapTitle={mapTitle} />

            {/* Share */}
            <button
                id="btn-share"
                title="Share this map"
                onClick={() => setIsShareModalOpen(true)}
                style={{ display: "flex", alignItems: "center", gap: "6px", padding: "7px 14px", borderRadius: "8px", flexShrink: 0, background: "#10b981", border: "none", cursor: "pointer", color: "white", fontSize: "13px", fontWeight: 600, fontFamily: "Inter, sans-serif", transition: "background 0.15s" }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#059669"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#10b981"; }}
            >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" /><polyline points="16 6 12 2 8 6" /><line x1="12" y1="2" x2="12" y2="15" />
                </svg>
                Share
            </button>

            {/* AI Generate */}
            {!isViewer && (
                <button
                    id="btn-ai-generate"
                    onClick={() => setIsAiModalOpen(true)}
                    title="Generate mindmap with AI"
                    style={{ display: "flex", alignItems: "center", gap: "6px", background: "linear-gradient(135deg, #6366f1, #8b5cf6)", border: "none", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", color: "white", fontSize: "12px", fontWeight: 600, fontFamily: "Inter, sans-serif", flexShrink: 0, boxShadow: "0 0 12px rgba(99,102,241,0.4)", transition: "box-shadow 0.2s, transform 0.15s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = "0 0 20px rgba(99,102,241,0.7)"; e.currentTarget.style.transform = "scale(1.04)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = "0 0 12px rgba(99,102,241,0.4)"; e.currentTarget.style.transform = "scale(1)"; }}
                >
                    <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2.2" viewBox="0 0 24 24">
                        <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                    </svg>
                    AI Generate
                </button>
            )}

            <ShareModal isOpen={isShareModalOpen} onClose={() => setIsShareModalOpen(false)} />
            {isAiModalOpen && <AiGenerateModal onClose={() => setIsAiModalOpen(false)} />}
            <PresenceAvatars />
        </header>
    );
}
