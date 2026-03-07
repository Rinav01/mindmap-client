import { useState } from "react";
import { useParams } from "react-router-dom";
import { exportMapJson, exportMapMarkdown, exportMapPng, exportMapPdf } from "../../services/exportService";

interface ExportMenuProps {
    mapTitle: string;
}

/**
 * Export dropdown button — PNG, PDF, JSON, Markdown.
 */
export default function ExportMenu({ mapTitle }: ExportMenuProps) {
    const { id } = useParams();
    const [open, setOpen] = useState(false);

    const options = [
        { label: "PNG Image", action: () => exportMapPng(mapTitle), icon: <polygon points="19 21 5 21 5 3 13 3 19 9 19 21" /> },
        { label: "PDF Document", action: () => exportMapPdf(mapTitle), icon: <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /> },
        { label: "JSON Data", action: () => { if (id) exportMapJson(id); }, icon: <polyline points="16 18 22 12 16 6" /> },
        { label: "Markdown Text", action: () => { if (id) exportMapMarkdown(id); }, icon: <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /> },
    ];

    return (
        <div style={{ position: "relative" }}>
            <button
                onClick={() => setOpen(!open)}
                style={{
                    display: "flex", alignItems: "center", gap: "6px",
                    padding: "7px 14px", borderRadius: "8px", flexShrink: 0,
                    background: open ? "#1d4ed8" : "#2563eb", border: "none", cursor: "pointer",
                    color: "white", fontSize: "13px", fontWeight: 600,
                    fontFamily: "Inter, sans-serif", transition: "background 0.15s",
                }}
                onMouseEnter={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8"; }}
                onMouseLeave={(e) => { if (!open) (e.currentTarget as HTMLButtonElement).style.background = "#2563eb"; }}
            >
                <svg width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Export
                <svg width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    style={{ marginLeft: "2px", transition: "transform 0.2s", transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>
                    <polyline points="6 9 12 15 18 9" />
                </svg>
            </button>

            {open && (
                <>
                    <div style={{ position: "fixed", inset: 0, zIndex: 60 }} onClick={() => setOpen(false)} />
                    <div style={{
                        position: "absolute", top: "calc(100% + 8px)", right: 0,
                        background: "#1e293b", border: "1px solid #334155",
                        borderRadius: "8px", padding: "6px", minWidth: "160px",
                        boxShadow: "0 10px 15px -3px rgba(0,0,0,0.3)", zIndex: 65,
                        display: "flex", flexDirection: "column", gap: "2px",
                    }}>
                        {options.map((opt) => (
                            <button
                                key={opt.label}
                                onClick={() => { opt.action(); setOpen(false); }}
                                style={{
                                    width: "100%", padding: "8px 10px", background: "transparent", border: "none",
                                    borderRadius: "6px", cursor: "pointer", color: "#d1d5db",
                                    fontSize: "13px", fontWeight: 500, fontFamily: "Inter, sans-serif",
                                    display: "flex", alignItems: "center", gap: "8px", textAlign: "left",
                                    transition: "background 0.15s, color 0.15s",
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
    );
}
