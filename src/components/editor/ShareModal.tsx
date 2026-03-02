import { useState } from "react";
import { api } from "../../services/api";
import { useParams } from "react-router-dom";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ShareModal({ isOpen, onClose }: Props) {
    const { id } = useParams();
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    if (!isOpen) return null;

    const handleShare = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !id) return;

        setLoading(true);
        setMessage(null);

        try {
            await api.post(`/mindmaps/${id}/share`, { email });
            setMessage({ text: "Invitation sent successfully!", type: 'success' });
            setEmail("");
            // Auto close after 2s
            setTimeout(() => {
                onClose();
                setMessage(null);
            }, 2000);
        } catch (err: any) {
            setMessage({
                text: err.response?.data?.error || "Failed to share map",
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex", alignItems: "center", justifyContent: "center",
            zIndex: 100,
            fontFamily: "Inter, sans-serif"
        }}>
            <div style={{
                background: "#1e293b",
                borderRadius: "12px",
                width: "400px",
                padding: "24px",
                boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
                border: "1px solid #334155"
            }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
                    <h2 style={{ margin: 0, color: "white", fontSize: "18px", fontWeight: 600 }}>Share Mind Map</h2>
                    <button
                        onClick={onClose}
                        style={{
                            background: "transparent", border: "none", color: "#9ca3af",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            padding: "4px", borderRadius: "4px"
                        }}
                    >
                        <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>

                <form onSubmit={handleShare}>
                    <label style={{ display: "block", color: "#cbd5e1", fontSize: "14px", marginBottom: "8px", fontWeight: 500 }}>
                        Invite Collaborator
                    </label>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <input
                            type="email"
                            placeholder="collaborator@example.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            style={{
                                flex: 1,
                                background: "#0f172a",
                                border: "1px solid #334155",
                                borderRadius: "6px",
                                padding: "10px 12px",
                                color: "white",
                                fontSize: "14px",
                                outline: "none",
                            }}
                        />
                        <button
                            type="submit"
                            disabled={loading || !email}
                            style={{
                                background: "#3b82f6",
                                color: "white",
                                border: "none",
                                borderRadius: "6px",
                                padding: "0 16px",
                                fontSize: "14px",
                                fontWeight: 600,
                                cursor: (loading || !email) ? "not-allowed" : "pointer",
                                opacity: (loading || !email) ? 0.7 : 1,
                                transition: "background 0.2s"
                            }}
                        >
                            {loading ? "Sending..." : "Invite"}
                        </button>
                    </div>
                </form>

                {message && (
                    <div style={{
                        marginTop: "16px",
                        padding: "10px 12px",
                        borderRadius: "6px",
                        fontSize: "14px",
                        background: message.type === 'success' ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                        color: message.type === 'success' ? "#4ade80" : "#f87171",
                        border: `1px solid ${message.type === 'success' ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`
                    }}>
                        {message.text}
                    </div>
                )}
            </div>
        </div>
    );
}
