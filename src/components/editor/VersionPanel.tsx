import { useEditorStore } from "../../store/editorStore";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

interface Props {
    onClose: () => void;
}

const sectionLabel: React.CSSProperties = {
    fontSize: "10px", fontWeight: 700, letterSpacing: "0.1em",
    color: "#6b7280", textTransform: "uppercase", marginBottom: "10px",
};

export default function VersionPanel({ onClose }: Props) {
    const { id: mindMapId } = useParams();
    const versions = useEditorStore((s) => s.versions);
    const loadVersions = useEditorStore((s) => s.loadVersions);
    const createSnapshot = useEditorStore((s) => s.createSnapshot);
    const restoreVersion = useEditorStore((s) => s.restoreVersion);

    const [newSnapshotName, setNewSnapshotName] = useState("");

    useEffect(() => {
        if (mindMapId) loadVersions(mindMapId);
    }, [mindMapId, loadVersions]);

    const handleCreateSnapshot = () => {
        if (!mindMapId || !newSnapshotName.trim()) return;
        createSnapshot(mindMapId, newSnapshotName.trim());
        setNewSnapshotName("");
    };

    const inputStyle: React.CSSProperties = {
        width: "100%", padding: "10px 12px",
        background: "#0f172a", border: "1px solid #334155",
        borderRadius: "8px", color: "white", fontSize: "13px",
        fontFamily: "Inter, sans-serif", outline: "none",
        boxSizing: "border-box",
    };

    return (
        <div style={{
            position: "fixed", top: 0, right: 0, height: "100%", width: "320px",
            background: "#111827", borderLeft: "1px solid #1f2937",
            zIndex: 60, display: "flex", flexDirection: "column",
            fontFamily: "Inter, sans-serif", overflowY: "auto",
            boxShadow: "-10px 0 30px rgba(0,0,0,0.5)",
        }}>
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "18px 18px 14px", borderBottom: "1px solid #1f2937",
            }}>
                <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", color: "#9ca3af", textTransform: "uppercase" }}>
                    History & Snapshots
                </span>
                <button
                    onClick={onClose}
                    style={{
                        background: "none", border: "none", cursor: "pointer",
                        color: "#6b7280", fontSize: "18px", lineHeight: 1, padding: "2px 4px",
                        borderRadius: "5px",
                    }}
                    onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
                    onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6b7280"; }}
                >×</button>
            </div>

            <div style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "24px" }}>
                {/* Create Snapshot */}
                <div>
                    <label style={sectionLabel}>Take a Snapshot</label>
                    <div style={{ display: "flex", gap: "8px" }}>
                        <input
                            placeholder="Snapshot name..."
                            value={newSnapshotName}
                            onChange={(e) => setNewSnapshotName(e.target.value)}
                            style={inputStyle}
                            onKeyDown={(e) => { if (e.key === "Enter") handleCreateSnapshot(); }}
                        />
                        <button
                            onClick={handleCreateSnapshot}
                            style={{
                                padding: "0 12px", borderRadius: "8px", background: "#3b82f6", color: "white",
                                border: "none", cursor: "pointer", fontSize: "13px", fontWeight: 600,
                            }}
                        >Save</button>
                    </div>
                </div>

                {/* Versions List */}
                <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
                    <label style={sectionLabel}>Previous Versions</label>
                    {versions.length === 0 ? (
                        <div style={{ color: "#4b5563", fontSize: "13px", textAlign: "center", padding: "40px 0" }}>
                            No snapshots yet.
                        </div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                            {[...versions].reverse().map((v) => (
                                <div key={v._id} style={{
                                    padding: "12px", background: "#1e293b", borderRadius: "10px",
                                    border: "1px solid #334155", display: "flex", flexDirection: "column", gap: "10px"
                                }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                                        <div>
                                            <div style={{ color: "white", fontSize: "13px", fontWeight: 600 }}>{v.name}</div>
                                            <div style={{ color: "#6b7280", fontSize: "11px", marginTop: "2px" }}>
                                                {new Date(v.createdAt).toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => {
                                            if (window.confirm(`Restore to "${v.name}"? This will overwrite your current map state.`)) {
                                                if (mindMapId) restoreVersion(mindMapId, v._id);
                                            }
                                        }}
                                        style={{
                                            width: "100%", padding: "8px", borderRadius: "6px",
                                            background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)",
                                            color: "#60a5fa", fontSize: "12px", fontWeight: 700, cursor: "pointer",
                                            transition: "all 0.15s",
                                            fontFamily: "Inter, sans-serif",
                                        }}
                                        onMouseEnter={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.2)";
                                            (e.currentTarget as HTMLButtonElement).style.borderColor = "#3b82f6";
                                        }}
                                        onMouseLeave={(e) => {
                                            (e.currentTarget as HTMLButtonElement).style.background = "rgba(59,130,246,0.1)";
                                            (e.currentTarget as HTMLButtonElement).style.borderColor = "rgba(59,130,246,0.2)";
                                        }}
                                    >Restore</button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
