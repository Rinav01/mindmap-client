import { useState } from "react";
import { api } from "../../services/api";
import { useParams } from "react-router-dom";
import { useEditorStore } from "../../store/editorStore";
import { useAuthStore } from "../../store/authStore";

interface Props {
    isOpen: boolean;
    onClose: () => void;
}

export default function ShareModal({ isOpen, onClose }: Props) {
    const { id } = useParams();
    const user = useAuthStore((s) => s.user);
    const mapMembers = useEditorStore((s) => s.mapMembers);
    const currentUserRole = useEditorStore((s) => s.currentUserRole);
    const loadMapMembers = useEditorStore((s) => s.loadMapMembers);

    const [email, setEmail] = useState("");
    const [role, setRole] = useState("EDITOR");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

    if (!isOpen) return null;

    const isOwner = currentUserRole === "OWNER";

    const handleInvite = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !id) return;

        setLoading(true);
        setMessage(null);

        try {
            await api.post(`/mindmaps/${id}/invite`, { email, role });
            setMessage({ text: "Invitation sent successfully!", type: 'success' });
            setEmail("");
            loadMapMembers(id);
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            setMessage({
                text: err.response?.data?.error || "Failed to invite user",
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleRoleChange = async (memberId: string, newRole: string) => {
        try {
            await api.put(`/mindmaps/${id}/members/${memberId}`, { role: newRole });
            loadMapMembers(id!);
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to change role");
        }
    };

    const handleRemoveMember = async (memberId: string) => {
        if (!confirm("Are you sure you want to remove this user from the map?")) return;
        try {
            await api.delete(`/mindmaps/${id}/members/${memberId}`);
            loadMapMembers(id!);
        } catch (err: any) {
            alert(err.response?.data?.error || "Failed to remove user");
        }
    };

    const handleCopyLink = () => {
        navigator.clipboard.writeText(window.location.href);
        setMessage({ text: "Link copied to clipboard!", type: 'success' });
        setTimeout(() => setMessage(null), 2000);
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
                width: "480px",
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

                {/* Copy Link Section */}
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "24px", paddingBottom: "20px", borderBottom: "1px solid #334155" }}>
                    <div style={{ flex: 1, padding: "10px", background: "#0f172a", border: "1px solid #334155", borderRadius: "6px", color: "#94a3b8", fontSize: "13px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {window.location.href}
                    </div>
                    <button onClick={handleCopyLink} style={{ padding: "10px 16px", background: "#334155", color: "white", border: "none", borderRadius: "6px", fontSize: "13px", fontWeight: 600, cursor: "pointer", transition: "background 0.2s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "#475569")} onMouseLeave={(e) => (e.currentTarget.style.background = "#334155")}>
                        Copy Link
                    </button>
                </div>

                {isOwner && (
                    <form onSubmit={handleInvite} style={{ marginBottom: "24px" }}>
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
                            <select
                                value={role}
                                onChange={(e) => setRole(e.target.value)}
                                style={{
                                    background: "#0f172a", border: "1px solid #334155", borderRadius: "6px",
                                    padding: "0 12px", color: "white", fontSize: "13px", outline: "none"
                                }}
                            >
                                <option value="EDITOR">Editor</option>
                                <option value="VIEWER">Viewer</option>
                            </select>
                            <button
                                type="submit"
                                disabled={loading || !email}
                                style={{
                                    background: "#3b82f6", color: "white", border: "none", borderRadius: "6px",
                                    padding: "0 16px", fontSize: "14px", fontWeight: 600,
                                    cursor: (loading || !email) ? "not-allowed" : "pointer",
                                    opacity: (loading || !email) ? 0.7 : 1, transition: "background 0.2s"
                                }}
                            >
                                {loading ? "..." : "Invite"}
                            </button>
                        </div>
                        {message && (
                            <div style={{
                                marginTop: "12px", padding: "10px 12px", borderRadius: "6px", fontSize: "13px",
                                background: message.type === 'success' ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)",
                                color: message.type === 'success' ? "#4ade80" : "#f87171",
                                border: `1px solid ${message.type === 'success' ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)"}`
                            }}>
                                {message.text}
                            </div>
                        )}
                    </form>
                )}

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", maxHeight: "250px", overflowY: "auto" }}>
                    <h3 style={{ margin: 0, color: "#94a3b8", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: 600 }}>People with access</h3>

                    {mapMembers.map((member) => (
                        <div key={member._id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <div style={{
                                    width: "36px", height: "36px", borderRadius: "50%", background: member.userId.color || "#3b82f6",
                                    display: "flex", alignItems: "center", justifyContent: "center", color: "white", fontWeight: 600, fontSize: "14px"
                                }}>
                                    {member.userId.username ? member.userId.username.charAt(0).toUpperCase() : "-"}
                                </div>
                                <div style={{ display: "flex", flexDirection: "column" }}>
                                    <span style={{ color: "white", fontSize: "14px", fontWeight: 500 }}>
                                        {member.userId.username} {user?._id === member.userId._id && "(You)"}
                                    </span>
                                    <span style={{ color: "#94a3b8", fontSize: "12px" }}>{member.userId.email}</span>
                                </div>
                            </div>

                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                {isOwner && member.role !== "OWNER" ? (
                                    <>
                                        <select
                                            value={member.role}
                                            onChange={(e) => handleRoleChange(member._id, e.target.value)}
                                            style={{
                                                background: "transparent", border: "1px solid #334155", borderRadius: "6px",
                                                padding: "6px 28px 6px 10px", color: "#cbd5e1", fontSize: "12px", outline: "none", cursor: "pointer",
                                                appearance: "none", backgroundImage: "url('data:image/svg+xml;utf8,<svg fill=\"%2394a3b8\" viewBox=\"0 0 24 24\" width=\"14\" height=\"14\"><path d=\"M7 10l5 5 5-5z\"/></svg>')",
                                                backgroundRepeat: "no-repeat", backgroundPosition: "right 6px center"
                                            }}
                                        >
                                            <option value="EDITOR" style={{ background: "#1e293b", color: "white" }}>Editor</option>
                                            <option value="VIEWER" style={{ background: "#1e293b", color: "white" }}>Viewer</option>
                                        </select>
                                        <button
                                            onClick={() => handleRemoveMember(member._id)}
                                            title="Remove Collaborator"
                                            style={{ background: "transparent", border: "none", color: "#64748b", cursor: "pointer", padding: "4px" }}
                                            onMouseEnter={(e) => (e.currentTarget.style.color = "#ef4444")}
                                            onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}
                                        >
                                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                                        </button>
                                    </>
                                ) : (
                                    <span style={{ color: "#94a3b8", fontSize: "13px", paddingRight: "8px", fontWeight: member.role === "OWNER" ? 600 : 400 }}>
                                        {member.role === "OWNER" ? "Owner" : member.role === "EDITOR" ? "Editor" : "Viewer"}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
