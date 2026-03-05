import { useEditorStore } from "../../store/editorStore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";

const COLORS = [
    { hex: "#ffffff", label: "White" },
    { hex: "#f87171", label: "Coral" },
    { hex: "#fb923c", label: "Orange" },
    { hex: "#4ade80", label: "Green" },
    { hex: "#60a5fa", label: "Blue" },
    { hex: "#c084fc", label: "Purple" },
];

const sectionLabel: React.CSSProperties = {
    fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
    color: "#6b7280", textTransform: "uppercase", marginBottom: "10px",
};

export default function NodePropertiesPanel() {
    const {
        nodes,
        selectedNodeIds,
        deleteSelectedNodes,
        updateNodeText,
        updateNodeNotes,
        updateNodeColor,
        updateNodeFontSize,
        deselectAll,
        broadcastEditing,
        broadcastEditingStopped,
        remoteEditingNodes,
        comments,
        loadComments,
        addComment,
        deleteComment,
    } = useEditorStore();

    // Only show panel if exactly one node is selected
    const singleSelectedId = selectedNodeIds.size === 1 ? selectedNodeIds.values().next().value : null;
    const selectedNode = singleSelectedId ? nodes.find((n) => n._id === singleSelectedId) : null;

    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");
    const [newComment, setNewComment] = useState("");
    const { id: mapId } = useParams();
    const currentUser = useAuthStore((s) => s.user);

    useEffect(() => {
        if (selectedNode) {
            setTitle(selectedNode.text);
            setNotes(selectedNode.notes || "");
            if (mapId) {
                loadComments(mapId, selectedNode._id);
            }
        }
    }, [selectedNode, mapId, loadComments]);

    if (!selectedNode) return null;

    const currentUserRole = useEditorStore.getState().currentUserRole;
    const isViewer = currentUserRole === "VIEWER";
    const isRemotelyEditing = !!remoteEditingNodes[selectedNode._id];
    const remoteEditor = remoteEditingNodes[selectedNode._id];
    const isDisabled = isViewer || isRemotelyEditing;

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "10px 12px",
        background: "#0f172a", border: "1px solid #334155",
        borderRadius: "8px", color: "white", fontSize: "13px",
        fontFamily: "Inter, sans-serif", outline: "none",
        boxSizing: "border-box",
    };

    return (
        <div style={{
            position: "fixed", top: 0, right: 0, height: "100%", width: "280px",
            background: "#111827", borderLeft: "1px solid #1f2937",
            zIndex: 50, display: "flex", flexDirection: "column",
            fontFamily: "Inter, sans-serif", overflowY: "auto",
        }}>
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "18px 18px 14px", borderBottom: "1px solid #1f2937",
            }}>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" }}>
                    Node Properties
                </span>
                <button
                    onClick={() => deselectAll()}
                    style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#6b7280", fontSize: "18px", lineHeight: 1, padding: "2px 4px",
                        borderRadius: "5px",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6b7280"; }}
                >×</button>
            </div>

            <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "20px" }}>
                {isRemotelyEditing && (
                    <div style={{ padding: "10px", background: "rgba(59,130,246,0.1)", border: `1px solid ${remoteEditor.color}`, borderRadius: "8px", color: remoteEditor.color, fontSize: "12px", fontWeight: 600, display: "flex", alignItems: "center", gap: "6px" }}>
                        ✏️ Locked by {remoteEditor.name}
                    </div>
                )}

                {/* Node Title */}
                <div>
                    <label htmlFor="node-title" style={sectionLabel}>Node Title</label>
                    <input
                        id="node-title"
                        name="node-title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => {
                            if (title !== selectedNode.text) {
                                updateNodeText(selectedNode._id, title);
                            }
                            broadcastEditingStopped(selectedNode._id);
                        }}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                if (title !== selectedNode.text) {
                                    updateNodeText(selectedNode._id, title);
                                }
                                broadcastEditingStopped(selectedNode._id);
                                e.currentTarget.blur();
                            }
                        }}
                        style={{ ...inputStyle, opacity: isDisabled ? 0.5 : 1 }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#3b82f6";
                            broadcastEditing(selectedNode._id);
                        }}
                        autoComplete="off"
                        disabled={isDisabled}
                    />
                </div>

                {/* Notes */}
                <div>
                    <label htmlFor="node-notes" style={sectionLabel}>Notes</label>
                    <textarea
                        id="node-notes"
                        name="node-notes"
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes..."
                        style={{
                            ...inputStyle, height: "80px", resize: "none",
                            lineHeight: "1.5",
                        }}
                        onFocus={(e) => {
                            e.currentTarget.style.borderColor = "#3b82f6";
                            broadcastEditing(selectedNode._id);
                        }}
                        onBlur={(e) => {
                            if (notes !== (selectedNode.notes || "")) {
                                updateNodeNotes(selectedNode._id, notes);
                            }
                            e.currentTarget.style.borderColor = "#334155";
                            broadcastEditingStopped(selectedNode._id);
                        }}
                        autoComplete="off"
                        disabled={isDisabled}
                    />
                </div>

                {/* Appearance */}
                <div>
                    <div style={sectionLabel}>Appearance</div>
                    <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                        {/* Color grid */}
                        <div style={{ flex: 1 }}>
                            <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "8px" }}>Background</div>
                            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "6px" }}>
                                {COLORS.map((c) => {
                                    const isActive = selectedNode.color === c.hex;
                                    return (
                                        <button
                                            key={c.hex}
                                            title={c.label}
                                            disabled={isDisabled}
                                            onClick={() => updateNodeColor(selectedNode._id, c.hex)}
                                            style={{
                                                width: "100%", aspectRatio: "1",
                                                background: c.hex === "#ffffff" ? "white" : c.hex,
                                                border: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                                                borderRadius: "7px", cursor: isDisabled ? "not-allowed" : "pointer",
                                                outline: isActive ? "2px solid rgba(59,130,246,0.4)" : "none",
                                                outlineOffset: "1px",
                                                transition: "outline 0.15s, border 0.15s",
                                                opacity: isDisabled ? 0.5 : 1,
                                            }}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Font size */}
                        <div>
                            <div style={{ fontSize: "11px", color: "#6b7280", marginBottom: "8px" }}>Font Size</div>
                            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <button
                                    disabled={isDisabled}
                                    onClick={() => updateNodeFontSize(selectedNode._id, (selectedNode.fontSize ?? 14) - 1)}
                                    style={{
                                        width: "28px", height: "28px", borderRadius: "7px",
                                        background: "#1e293b", border: "1px solid #334155",
                                        color: "white", cursor: isDisabled ? "not-allowed" : "pointer", fontSize: "16px",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        opacity: isDisabled ? 0.5 : 1,
                                    }}
                                >−</button>
                                <span style={{ color: "white", fontSize: "14px", fontWeight: 600, minWidth: "24px", textAlign: "center" }}>
                                    {selectedNode.fontSize ?? 14}
                                </span>
                                <button
                                    disabled={isDisabled}
                                    onClick={() => updateNodeFontSize(selectedNode._id, (selectedNode.fontSize ?? 14) + 1)}
                                    style={{
                                        width: "28px", height: "28px", borderRadius: "7px",
                                        background: "#1e293b", border: "1px solid #334155",
                                        color: "white", cursor: isDisabled ? "not-allowed" : "pointer", fontSize: "16px",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                        opacity: isDisabled ? 0.5 : 1,
                                    }}
                                >+</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attachments (mock UI deleted for cleanup) */}
                <div>
                    <button style={{
                        width: "100%", padding: "9px", borderRadius: "8px",
                        background: "transparent", border: "1px dashed #334155",
                        color: "#6b7280", fontSize: "12px", fontWeight: 600,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                        letterSpacing: "0.05em", textTransform: "uppercase",
                        transition: "border-color 0.15s, color 0.15s",
                    }}
                        title="File attachments coming soon!"
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#3b82f6"; (e.currentTarget as HTMLButtonElement).style.color = "#3b82f6"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#334155"; (e.currentTarget as HTMLButtonElement).style.color = "#6b7280"; }}
                    >
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload File
                    </button>
                </div>

                {/* â”€â”€â”€ Comments Section â”€â”€â”€ */}
                <div style={{ marginTop: "10px", borderTop: "1px solid #1f2937", paddingTop: "20px" }}>
                    <div style={{ ...sectionLabel, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        Comments
                        <span style={{ background: "#1e293b", padding: "2px 6px", borderRadius: "10px", color: "#9ca3af", fontSize: "9px" }}>
                            {comments[selectedNode._id]?.length || 0}
                        </span>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "250px", overflowY: "auto", paddingRight: "4px" }}>
                        {(comments[selectedNode._id] || []).map((c) => (
                            <div key={c._id} style={{ display: "flex", gap: "10px" }}>
                                <div style={{
                                    width: "28px", height: "28px", borderRadius: "50%", background: c.userId?.color || "#3b82f6",
                                    color: "white", display: "flex", alignItems: "center", justifyContent: "center",
                                    fontSize: "12px", fontWeight: 700, flexShrink: 0
                                }}>
                                    {(c.userId?.name || c.userId?.username || "?").charAt(0).toUpperCase()}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2px" }}>
                                        <div style={{ color: "white", fontSize: "12px", fontWeight: 600 }}>
                                            {c.userId?.name || c.userId?.username || "Unknown User"}
                                        </div>
                                        <div style={{ color: "#6b7280", fontSize: "10px" }}>
                                            {new Date(c.createdAt).toLocaleDateString()}
                                        </div>
                                        {((currentUser?._id === c.userId._id) || currentUserRole === "OWNER") && !isViewer && (
                                            <button
                                                onClick={() => {
                                                    if (mapId) deleteComment(mapId, selectedNode._id, c._id);
                                                }}
                                                style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", marginLeft: "10px", padding: 0 }}
                                                title="Delete Comment"
                                            >
                                                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                                                </svg>
                                            </button>
                                        )}
                                    </div>
                                    <div style={{ color: "#d1d5db", fontSize: "12px", lineHeight: 1.4, wordBreak: "break-word" }}>
                                        {c.content}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {!isViewer && (
                        <div style={{ marginTop: "12px", display: "flex", gap: "8px" }}>
                            <input
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter" && newComment.trim() && mapId) {
                                        addComment(mapId, selectedNode._id, newComment);
                                        setNewComment("");
                                    }
                                }}
                                placeholder="Add a comment..."
                                style={{
                                    flex: 1, padding: "8px 12px",
                                    background: "#0f172a", border: "1px solid #334155",
                                    borderRadius: "8px", color: "white", fontSize: "12px",
                                    fontFamily: "Inter, sans-serif", outline: "none",
                                }}
                            />
                            <button
                                onClick={() => {
                                    if (newComment.trim() && mapId) {
                                        addComment(mapId, selectedNode._id, newComment);
                                        setNewComment("");
                                    }
                                }}
                                disabled={!newComment.trim()}
                                style={{
                                    background: newComment.trim() ? "#2563eb" : "#1e293b",
                                    color: newComment.trim() ? "white" : "#6b7280",
                                    border: "none", borderRadius: "8px", padding: "0 12px",
                                    cursor: newComment.trim() ? "pointer" : "not-allowed",
                                    transition: "background 0.15s, color 0.15s"
                                }}
                            >
                                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                    <line x1="22" y1="2" x2="11" y2="13" />
                                    <polygon points="22 2 15 22 11 13 2 9 22 2" />
                                </svg>
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Delete */}
            <div style={{ padding: "0 18px 18px", marginTop: "auto" }}>
                <button
                    onClick={() => deleteSelectedNodes()}
                    style={{
                        width: "100%", padding: "11px",
                        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: "9px", color: "#f87171", fontSize: "12px", fontWeight: 700,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "7px",
                        letterSpacing: "0.08em", textTransform: "uppercase",
                        transition: "background 0.15s, border-color 0.15s",
                        fontFamily: "Inter, sans-serif",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.2)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "#ef4444"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"; (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(239,68,68,0.3)"; }}
                >
                    <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                    </svg>
                    Delete Node
                </button>
            </div>
        </div>
    );
}
