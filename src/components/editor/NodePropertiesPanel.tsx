import { useEditorStore } from "../../store/editorStore";
import { useEffect, useState } from "react";

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
        selectedNodeId,
        deleteNode,
        updateNodeText,
        updateNodeColor,
        updateNodeFontSize,
        selectNode,
    } = useEditorStore();

    const selectedNode = nodes.find((n) => n._id === selectedNodeId);

    const [title, setTitle] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        if (selectedNode) {
            setTitle(selectedNode.text);
        }
    }, [selectedNode]);

    if (!selectedNode) return null;

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
                    onClick={() => selectNode("")}
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
                {/* Node Title */}
                <div>
                    <div style={sectionLabel}>Node Title</div>
                    <input
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        onBlur={() => updateNodeText(selectedNode._id, title)}
                        onKeyDown={(e) => { if (e.key === "Enter") updateNodeText(selectedNode._id, title); }}
                        style={inputStyle}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; }}
                    />
                </div>

                {/* Notes */}
                <div>
                    <div style={sectionLabel}>Notes</div>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Add notes..."
                        style={{
                            ...inputStyle, height: "80px", resize: "none",
                            lineHeight: "1.5",
                        }}
                        onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; }}
                        onBlur={(e) => { e.currentTarget.style.borderColor = "#334155"; }}
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
                                            onClick={() => updateNodeColor(selectedNode._id, c.hex)}
                                            style={{
                                                width: "100%", aspectRatio: "1",
                                                background: c.hex === "#ffffff" ? "white" : c.hex,
                                                border: isActive ? "2px solid #3b82f6" : "2px solid transparent",
                                                borderRadius: "7px", cursor: "pointer",
                                                outline: isActive ? "2px solid rgba(59,130,246,0.4)" : "none",
                                                outlineOffset: "1px",
                                                transition: "outline 0.15s, border 0.15s",
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
                                    onClick={() => updateNodeFontSize(selectedNode._id, (selectedNode.fontSize ?? 14) - 1)}
                                    style={{
                                        width: "28px", height: "28px", borderRadius: "7px",
                                        background: "#1e293b", border: "1px solid #334155",
                                        color: "white", cursor: "pointer", fontSize: "16px",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}
                                >−</button>
                                <span style={{ color: "white", fontSize: "14px", fontWeight: 600, minWidth: "24px", textAlign: "center" }}>
                                    {selectedNode.fontSize ?? 14}
                                </span>
                                <button
                                    onClick={() => updateNodeFontSize(selectedNode._id, (selectedNode.fontSize ?? 14) + 1)}
                                    style={{
                                        width: "28px", height: "28px", borderRadius: "7px",
                                        background: "#1e293b", border: "1px solid #334155",
                                        color: "white", cursor: "pointer", fontSize: "16px",
                                        display: "flex", alignItems: "center", justifyContent: "center",
                                    }}
                                >+</button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attachments (mock UI) */}
                <div>
                    <div style={sectionLabel}>Attachments</div>
                    <div style={{
                        display: "flex", alignItems: "center", gap: "10px",
                        padding: "10px 12px", background: "#0f172a",
                        border: "1px solid #334155", borderRadius: "8px", marginBottom: "8px",
                    }}>
                        <div style={{
                            width: "28px", height: "28px", background: "#1e3a5f",
                            borderRadius: "6px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
                        }}>
                            <svg width="14" height="14" fill="none" stroke="#60a5fa" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ color: "white", fontSize: "12px", fontWeight: 500, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                                Project_Brief_Final.pdf
                            </div>
                            <div style={{ color: "#6b7280", fontSize: "11px" }}>2 hours ago</div>
                        </div>
                        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "2px" }}>
                            <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" />
                            </svg>
                        </button>
                    </div>
                    <button style={{
                        width: "100%", padding: "9px", borderRadius: "8px",
                        background: "transparent", border: "1px dashed #334155",
                        color: "#6b7280", fontSize: "12px", fontWeight: 600,
                        cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px",
                        letterSpacing: "0.05em", textTransform: "uppercase",
                        transition: "border-color 0.15s, color 0.15s",
                    }}
                        onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#3b82f6"; (e.currentTarget as HTMLButtonElement).style.color = "#3b82f6"; }}
                        onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.borderColor = "#334155"; (e.currentTarget as HTMLButtonElement).style.color = "#6b7280"; }}
                    >
                        <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                        </svg>
                        Upload File
                    </button>
                </div>

                {/* Metadata */}
                <div style={{ display: "flex", gap: "12px" }}>
                    <div style={{ flex: 1 }}>
                        <div style={sectionLabel}>Created By</div>
                        <div style={{ color: "white", fontSize: "13px" }}>Alex Johnson</div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <div style={sectionLabel}>Last Edited</div>
                        <div style={{ color: "white", fontSize: "13px" }}>Today, 10:24 AM</div>
                    </div>
                </div>
            </div>

            {/* Delete */}
            <div style={{ padding: "0 18px 18px", marginTop: "auto" }}>
                <button
                    onClick={() => deleteNode(selectedNode._id)}
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
