import { useEffect, useRef } from "react";

interface ToastProps {
    message: string;
    onUndo?: () => void;
    onDismiss: () => void;
}

export default function Toast({ message, onUndo, onDismiss }: ToastProps) {
    const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        timerRef.current = setTimeout(onDismiss, 4000);
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
        };
    }, [onDismiss]);

    return (
        <div style={{
            position: "fixed", bottom: "90px", left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: "12px",
            background: "#1e293b", border: "1px solid #334155",
            borderRadius: "12px", padding: "10px 16px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            zIndex: 60, fontFamily: "Inter, sans-serif",
            animation: "slideUp 0.2s ease",
        }}>
            <style>{`
                @keyframes slideUp {
                    from { opacity: 0; transform: translateX(-50%) translateY(10px); }
                    to   { opacity: 1; transform: translateX(-50%) translateY(0); }
                }
            `}</style>
            <span style={{ color: "#e2e8f0", fontSize: "13px", fontWeight: 500 }}>
                {message}
            </span>
            {onUndo && (
                <button
                    onClick={() => { onUndo(); onDismiss(); }}
                    style={{
                        background: "#2563eb", border: "none", cursor: "pointer",
                        color: "white", fontSize: "12px", fontWeight: 600,
                        padding: "4px 10px", borderRadius: "7px",
                        fontFamily: "Inter, sans-serif",
                    }}
                >
                    Undo
                </button>
            )}
            <button
                onClick={onDismiss}
                style={{
                    background: "transparent", border: "none", cursor: "pointer",
                    color: "#6b7280", padding: "2px", display: "flex",
                    alignItems: "center", justifyContent: "center",
                }}
                title="Dismiss"
            >
                <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
            </button>
        </div>
    );
}
