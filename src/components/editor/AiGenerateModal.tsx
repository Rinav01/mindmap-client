import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { useEditorStore } from "../../store/editorStore";
import { generateMindmapFromAI } from "../../services/aiService";

interface Props {
    onClose: () => void;
}

export default function AiGenerateModal({ onClose }: Props) {
    const { id: mindMapId } = useParams<{ id: string }>();
    const [topic, setTopic] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const replaceNodes = useEditorStore((s) => s.replaceNodes);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    const handleGenerate = async () => {
        if (!topic.trim() || !mindMapId) return;
        setIsLoading(true);
        setError(null);
        try {
            await generateMindmapFromAI(topic.trim(), mindMapId);
            // Silently reload nodes without unmounting the Canvas
            await replaceNodes(mindMapId);
            onClose();
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "AI generation failed";
            setError(msg);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && !isLoading) handleGenerate();
        if (e.key === "Escape") onClose();
    };

    return (
        <>
            {/* Backdrop */}
            <div
                onClick={onClose}
                style={{
                    position: "fixed", inset: 0,
                    background: "rgba(0,0,0,0.6)",
                    backdropFilter: "blur(4px)",
                    zIndex: 1000,
                }}
            />

            {/* Modal */}
            <div style={{
                position: "fixed",
                top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                background: "#1e293b",
                border: "1px solid #334155",
                borderRadius: "16px",
                padding: "32px",
                width: "420px",
                maxWidth: "90vw",
                zIndex: 1001,
                fontFamily: "Inter, sans-serif",
                boxShadow: "0 24px 60px rgba(0,0,0,0.6)",
            }}>
                {/* Header */}
                <div style={{ marginBottom: "24px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
                        {/* Sparkle icon */}
                        <div style={{
                            width: "36px", height: "36px", borderRadius: "10px",
                            background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            flexShrink: 0,
                        }}>
                            <svg width="18" height="18" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
                                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                            </svg>
                        </div>
                        <div>
                            <h2 style={{ margin: 0, fontSize: "17px", fontWeight: 700, color: "#f1f5f9" }}>
                                Generate with AI
                            </h2>
                            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>
                                Powered by Groq · Llama 3 70B
                            </p>
                        </div>
                    </div>
                </div>

                {/* Input */}
                <label style={{ display: "block", fontSize: "13px", fontWeight: 500, color: "#94a3b8", marginBottom: "8px" }}>
                    Enter a topic for your mindmap
                </label>
                <input
                    ref={inputRef}
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="e.g. Machine Learning, Climate Change, React Hooks..."
                    disabled={isLoading}
                    style={{
                        width: "100%",
                        background: "#0f172a",
                        border: "1px solid #334155",
                        borderRadius: "10px",
                        padding: "12px 14px",
                        fontSize: "14px",
                        color: "#f1f5f9",
                        outline: "none",
                        fontFamily: "Inter, sans-serif",
                        boxSizing: "border-box",
                        transition: "border-color 0.2s",
                    }}
                    onFocus={(e) => (e.target.style.borderColor = "#6366f1")}
                    onBlur={(e) => (e.target.style.borderColor = "#334155")}
                />

                {/* Error */}
                {error && (
                    <div style={{
                        marginTop: "10px", padding: "10px 12px",
                        background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                        borderRadius: "8px", fontSize: "12px", color: "#f87171",
                    }}>
                        {error}
                    </div>
                )}

                {/* Loading hint */}
                {isLoading && (
                    <div style={{
                        marginTop: "10px", display: "flex", alignItems: "center", gap: "8px",
                        fontSize: "12px", color: "#94a3b8",
                    }}>
                        <div style={{
                            width: "14px", height: "14px", border: "2px solid #334155",
                            borderTopColor: "#6366f1", borderRadius: "50%",
                            animation: "spin 0.8s linear infinite",
                            flexShrink: 0,
                        }} />
                        Generating your mindmap with AI… this can take 5–15 seconds
                    </div>
                )}

                <style>{`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}</style>

                {/* Actions */}
                <div style={{ display: "flex", gap: "10px", marginTop: "24px", justifyContent: "flex-end" }}>
                    <button
                        onClick={onClose}
                        disabled={isLoading}
                        style={{
                            background: "transparent", border: "1px solid #334155",
                            borderRadius: "9px", padding: "9px 18px",
                            color: "#94a3b8", fontSize: "13px", fontWeight: 500,
                            cursor: "pointer", fontFamily: "Inter, sans-serif",
                        }}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleGenerate}
                        disabled={isLoading || !topic.trim()}
                        style={{
                            background: isLoading || !topic.trim()
                                ? "#312e81"
                                : "linear-gradient(135deg, #6366f1, #8b5cf6)",
                            border: "none",
                            borderRadius: "9px", padding: "9px 20px",
                            color: isLoading || !topic.trim() ? "#6b7280" : "white",
                            fontSize: "13px", fontWeight: 600,
                            cursor: isLoading || !topic.trim() ? "not-allowed" : "pointer",
                            fontFamily: "Inter, sans-serif",
                            transition: "all 0.2s",
                            display: "flex", alignItems: "center", gap: "6px",
                        }}
                    >
                        {isLoading ? "Generating…" : "✨ Generate"}
                    </button>
                </div>
            </div>
        </>
    );
}
