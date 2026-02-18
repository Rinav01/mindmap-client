import { useState } from "react";

const shortcuts = [
    { key: "Delete", desc: "Delete selected node" },
    { key: "Escape", desc: "Deselect node" },
    { key: "Ctrl + Z", desc: "Undo" },
    { key: "Ctrl + Y", desc: "Redo" },
    { key: "Double-click", desc: "Edit node text" },
    { key: "Enter", desc: "Confirm text edit" },
    { key: "Space + drag", desc: "Pan canvas" },
    { key: "Scroll", desc: "Zoom in / out" },
];

export default function KeyboardShortcuts() {
    const [open, setOpen] = useState(false);

    return (
        <>
            {/* ? Button */}
            <button
                onClick={() => setOpen((v) => !v)}
                title="Keyboard shortcuts"
                style={{
                    position: "fixed", bottom: "16px", left: "152px",
                    width: "28px", height: "28px", borderRadius: "50%",
                    background: "#1e293b", border: "1px solid #334155",
                    color: "#6b7280", cursor: "pointer",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "13px", fontWeight: 700,
                    fontFamily: "Inter, sans-serif",
                    boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
                    zIndex: 41,
                    transition: "background 0.15s, color 0.15s",
                }}
                onMouseEnter={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#334155";
                    (e.currentTarget as HTMLButtonElement).style.color = "white";
                }}
                onMouseLeave={(e) => {
                    (e.currentTarget as HTMLButtonElement).style.background = "#1e293b";
                    (e.currentTarget as HTMLButtonElement).style.color = "#6b7280";
                }}
            >
                ?
            </button>

            {/* Shortcuts panel */}
            {open && (
                <div style={{
                    position: "fixed", bottom: "52px", left: "16px",
                    background: "#1e293b", border: "1px solid #334155",
                    borderRadius: "12px", padding: "12px 16px",
                    zIndex: 50, fontFamily: "Inter, sans-serif",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                    minWidth: "240px",
                    animation: "fadeIn 0.15s ease",
                }}>
                    <style>{`@keyframes fadeIn { from { opacity:0; transform:translateY(6px); } to { opacity:1; transform:translateY(0); } }`}</style>
                    <div style={{
                        color: "#94a3b8", fontSize: "10px", fontWeight: 700,
                        letterSpacing: "0.1em", textTransform: "uppercase",
                        marginBottom: "10px",
                    }}>
                        Keyboard Shortcuts
                    </div>
                    {shortcuts.map(({ key, desc }) => (
                        <div key={key} style={{
                            display: "flex", justifyContent: "space-between",
                            alignItems: "center", gap: "16px",
                            padding: "5px 0",
                            borderBottom: "1px solid #1f2937",
                        }}>
                            <span style={{ color: "#94a3b8", fontSize: "12px" }}>{desc}</span>
                            <kbd style={{
                                background: "#0f172a", border: "1px solid #334155",
                                borderRadius: "5px", padding: "2px 7px",
                                color: "#60a5fa", fontSize: "11px", fontWeight: 600,
                                fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
                            }}>
                                {key}
                            </kbd>
                        </div>
                    ))}
                </div>
            )}
        </>
    );
}
