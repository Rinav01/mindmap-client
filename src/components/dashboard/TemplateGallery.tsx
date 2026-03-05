import { useEffect, useState } from "react";
import { fetchTemplates, createMapFromTemplate, type TemplateType } from "../../services/templateService";
import { useNavigate } from "react-router-dom";

export default function TemplateGallery({ view }: { view?: string }) {
    const [templates, setTemplates] = useState<TemplateType[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingTemplateId, setLoadingTemplateId] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        // Only fetch and show templates on the "All Maps" or default dashboard view
        if (view && view !== "all") return;

        let mounted = true;
        setLoading(true);
        fetchTemplates()
            .then((data) => {
                if (mounted) setTemplates(data);
            })
            .catch((err) => console.error("Failed to load templates", err))
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => { mounted = false; };
    }, [view]);

    if (view && view !== "all") return null;
    if (loading) return null; // Or a skeleton if desired
    if (templates.length === 0) return null;

    const handleUseTemplate = async (templateId: string) => {
        try {
            setLoadingTemplateId(templateId);
            const { mapId } = await createMapFromTemplate(templateId);
            navigate(`/editor/${mapId}`);
        } catch (error) {
            console.error(error);
            setLoadingTemplateId(null);
        }
    };

    const getIcon = (category: string) => {
        switch (category?.toLowerCase()) {
            case "business": return "💼";
            case "agile": return "🚀";
            case "education": return "🎓";
            case "creative": return "💡";
            default: return "📄";
        }
    };

    return (
        <div style={{ marginBottom: "32px", fontFamily: "Inter, sans-serif" }}>
            <h2 style={{
                color: "white", fontSize: "16px", fontWeight: 600,
                marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px"
            }}>
                Start from a Template
            </h2>
            <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "16px",
            }}>
                {templates.map((tpl) => (
                    <button
                        key={tpl._id}
                        onClick={() => handleUseTemplate(tpl._id)}
                        disabled={loadingTemplateId !== null}
                        style={{
                            background: "#1e293b",
                            border: "1px dashed #3b82f6",
                            borderRadius: "14px",
                            padding: "16px",
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "flex-start",
                            textAlign: "left",
                            cursor: loadingTemplateId !== null ? "wait" : "pointer",
                            transition: "transform 0.15s, box-shadow 0.15s, background 0.15s",
                            opacity: loadingTemplateId && loadingTemplateId !== tpl._id ? 0.5 : 1,
                        }}
                        onMouseEnter={(e) => {
                            if (!loadingTemplateId) {
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-2px)";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 8px 24px rgba(59, 130, 246, 0.2)";
                                (e.currentTarget as HTMLButtonElement).style.background = "#253b59";
                            }
                        }}
                        onMouseLeave={(e) => {
                            if (!loadingTemplateId) {
                                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
                                (e.currentTarget as HTMLButtonElement).style.background = "#1e293b";
                            }
                        }}
                    >
                        <div style={{ fontSize: "24px", marginBottom: "12px", display: "flex", justifyContent: "space-between", width: "100%" }}>
                            {getIcon(tpl.category)}
                            {loadingTemplateId === tpl._id && (
                                <div className="spinner" style={{
                                    width: "16px", height: "16px",
                                    border: "2px solid #3b82f6", borderTopColor: "transparent",
                                    borderRadius: "50%", animation: "spin 1s linear infinite"
                                }} />
                            )}
                        </div>
                        <div style={{ color: "white", fontSize: "14px", fontWeight: 600, marginBottom: "4px" }}>
                            {tpl.title}
                        </div>
                        <div style={{ color: "#94a3b8", fontSize: "12px", lineHeight: "1.4" }}>
                            {tpl.description}
                        </div>
                    </button>
                ))}
            </div>
            {/* Minimal inline spinner keyframes */}
            <style>{`
                @keyframes spin { 100% { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
}
