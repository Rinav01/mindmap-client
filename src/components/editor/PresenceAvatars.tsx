import { useEditorStore } from "../../store/editorStore";

/**
 * Renders overlapping avatar bubbles for all currently online collaborators.
 * Shows up to 5 avatars and a "+N" overflow badge.
 */
export default function PresenceAvatars() {
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
                        marginLeft: "-8px", zIndex: 0, fontFamily: "Inter, sans-serif",
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
                            background: user.color, border: "2px solid #0f172a",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            color: "white", fontSize: "11px", fontWeight: 700,
                            marginLeft: i > 0 ? "-8px" : "0",
                            zIndex: maxVisible - i, cursor: "pointer",
                            transition: "transform 0.15s", fontFamily: "Inter, sans-serif",
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
