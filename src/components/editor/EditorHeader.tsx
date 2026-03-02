import { useState } from "react";
import { useParams } from "react-router-dom";
import { useEditorStore } from "../../store/editorStore";
import ShareModal from "./ShareModal";

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

interface Props {
    onAddNode?: () => void;
    onToggleHistory?: () => void;
    isHistoryOpen?: boolean;
}

export default function EditorHeader({ onAddNode, onToggleHistory, isHistoryOpen }: Props) {
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

    const [editingTitle, setEditingTitle] = useState(false);
    const [titleDraft, setTitleDraft] = useState("");
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);

    const handleTitleClick = () => {
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
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}
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

                {/* Undo */}
                <button
                    style={iconBtn()}
                    onClick={undo}
                    title="Undo (Ctrl+Z)"
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}
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
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}
                >
                    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="15 14 20 9 15 4" /><path d="M4 20v-7a4 4 0 0 1 4-4h12" />
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

            {/* Export */}
            <button style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "7px 14px", borderRadius: "8px", flexShrink: 0,
                background: "#2563eb", border: "none", cursor: "pointer",
                color: "white", fontSize: "13px", fontWeight: 600,
                fontFamily: "Inter, sans-serif", transition: "background 0.15s",
            }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2563eb"; }}
            >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Export
            </button>

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

            {/* Avatar */}
            <div style={{
                width: "32px", height: "32px", borderRadius: "50%", flexShrink: 0,
                background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "white", fontSize: "12px", fontWeight: 700, cursor: "pointer",
            }}>A</div>
        </header>
    );
}
