import { useEditorStore } from "../../store/editorStore";

interface Props {
    panelOpen?: boolean;
}

export default function ZoomControls({ panelOpen = false }: Props) {
    const zoom = useEditorStore((s) => s.zoom);
    const setZoom = useEditorStore((s) => s.setZoom);
    const fitToScreen = useEditorStore((s) => s.fitToScreen);

    const btnStyle: React.CSSProperties = {
        background: "transparent", border: "none", cursor: "pointer",
        color: "#9ca3af", padding: "8px",
        display: "flex", alignItems: "center", justifyContent: "center",
        borderRadius: "7px", transition: "background 0.15s, color 0.15s",
        width: "36px",
    };

    return (
        <div style={{
            position: "fixed",
            right: panelOpen ? "296px" : "16px",
            top: "50%", transform: "translateY(-50%)",
            display: "flex", flexDirection: "column", alignItems: "center",
            background: "#1e293b", border: "1px solid #334155",
            borderRadius: "12px", padding: "4px",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            zIndex: 40, fontFamily: "Inter, sans-serif",
            transition: "right 0.25s ease",
        }}>


            {/* Zoom in */}
            <button
                style={btnStyle}
                onClick={() => setZoom(zoom + 0.1)}
                title="Zoom In"
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#334155"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}
            >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </button>

            {/* Zoom % */}
            <div style={{
                color: "#9ca3af", fontSize: "11px", fontWeight: 600,
                padding: "4px 0", textAlign: "center", width: "36px",
                borderTop: "1px solid #334155", borderBottom: "1px solid #334155",
                letterSpacing: "0.02em",
            }}>
                {Math.round(zoom * 100)}%
            </div>

            {/* Zoom out */}
            <button
                style={btnStyle}
                onClick={() => setZoom(zoom - 0.1)}
                title="Zoom Out"
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#334155"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}
            >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                    <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
            </button>

            {/* Fit to screen — now actually centers on nodes */}
            <button
                style={{ ...btnStyle, marginTop: "2px" }}
                onClick={fitToScreen}
                title="Fit to Screen"
                onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#334155"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}
            >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                </svg>
            </button>
        </div>
    );
}
