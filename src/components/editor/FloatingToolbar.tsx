import { useState } from "react";
import { useEditorStore } from "../../store/editorStore";
import { useParams } from "react-router-dom";

interface Props {
    onDelete?: () => void;
}

export default function FloatingToolbar({ onDelete }: Props) {
    const { id } = useParams();
    const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds);
    const nodes = useEditorStore((s) => s.nodes);
    const createNode = useEditorStore((s) => s.createNode);
    const deleteSelectedNodes = useEditorStore((s) => s.deleteSelectedNodes);
    const startEditing = useEditorStore((s) => s.startEditing);
    const alignSelectedNodes = useEditorStore((s) => s.alignSelectedNodes);
    const distributeSelectedNodes = useEditorStore((s) => s.distributeSelectedNodes);
    const focusNodeId = useEditorStore((s) => s.focusNodeId);
    const setFocusNodeId = useEditorStore((s) => s.setFocusNodeId);
    const expandNodeWithAI = useEditorStore((s) => s.expandNodeWithAI);

    const [isExpanding, setIsExpanding] = useState(false);

    // For toolbar, if multiple selected, dragging is main action.
    // If single selected, show standard toolbar.
    // If multiple, maybe show only Delete?
    // Let's stick to single node actions if 1 selected, else just Delete.

    const singleSelectedId = selectedNodeIds.size === 1 ? selectedNodeIds.values().next().value : null;
    const selectedNode = singleSelectedId ? nodes.find((n) => n._id === singleSelectedId) : null;
    const hasSelection = selectedNodeIds.size > 0;

    const handleAddNode = () => {
        if (!selectedNode || !id) return;
        if (selectedNode.parentId) {
            // Non-root: add a sibling (child of parent)
            const parent = nodes.find((n) => n._id === selectedNode.parentId);
            if (parent) createNode(id, parent);
        } else {
            // Root: add a child
            createNode(id, selectedNode);
        }
    };

    const handleDelete = () => {
        if (onDelete) {
            onDelete();
        } else if (hasSelection) {
            deleteSelectedNodes();
        }
    };

    const handleEditText = () => {
        if (singleSelectedId) startEditing(singleSelectedId);
    };

    const handleExpandWithAI = async () => {
        if (!singleSelectedId || !id || !selectedNode || isExpanding) return;
        setIsExpanding(true);
        try {
            await expandNodeWithAI(id, singleSelectedId, selectedNode.text);
        } finally {
            setIsExpanding(false);
        }
    };

    const toolItems = [
        {
            title: selectedNode ? (selectedNode.parentId ? "Add sibling node" : "Add child node") : "Select a node first",
            icon: (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
                </svg>
            ),
            onClick: handleAddNode,
            disabled: !selectedNode,
        },
        {
            title: selectedNode ? "✨ Expand With AI" : "Select a node first",
            icon: isExpanding ? (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" style={{ animation: "spin 1s linear infinite" }}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4V2m0 20v-2m8-8h2M2 12h2m15.364-7.364l1.414-1.414M4.222 19.778l1.414-1.414m12.728 0l-1.414-1.414M5.636 5.636L4.222 4.222" />
                </svg>
            ) : (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
                </svg>
            ),
            onClick: handleExpandWithAI,
            disabled: !selectedNode || isExpanding,
            ai: true,
        },
        {
            title: "Link (coming soon)",
            icon: (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="4 7 4 4 20 4 20 7" /><line x1="9" y1="20" x2="15" y2="20" /><line x1="12" y1="4" x2="12" y2="20" />
                </svg>
            ),
            onClick: handleEditText,
            disabled: !selectedNode,
        },
        {
            title: "Draw (coming soon)",
            icon: (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
                </svg>
            ),
            onClick: undefined,
            disabled: true,
        },
        {
            id: "btn-focus-subtree",
            title: selectedNode ? (focusNodeId === selectedNode._id ? "Exit Focus" : "Focus on Subtree") : "Select a node first",
            icon: (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M3 7V5a2 2 0 0 1 2-2h2"></path>
                    <path d="M17 3h2a2 2 0 0 1 2 2v2"></path>
                    <path d="M21 17v2a2 2 0 0 1-2 2h-2"></path>
                    <path d="M7 21H5a2 2 0 0 1-2-2v-2"></path>
                </svg>
            ),
            onClick: () => {
                if (focusNodeId === selectedNode?._id) setFocusNodeId(null);
                else setFocusNodeId(selectedNode?._id || null);
            },
            disabled: !selectedNode,
        },
        {
            title: hasSelection ? (selectedNodeIds.size > 1 ? `Delete ${selectedNodeIds.size} nodes` : "Delete selected node") : "Select a node first",
            icon: (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" />
                </svg>
            ),
            onClick: handleDelete,
            disabled: !hasSelection,
            danger: true,
        },
    ];

    const alignTools = [
        {
            title: "Align Left",
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="3" x2="3" y2="21" /><rect x="7" y="5" width="14" height="4" rx="1" /><rect x="7" y="15" width="10" height="4" rx="1" /></svg>,
            onClick: () => alignSelectedNodes("left"),
        },
        {
            title: "Align Center",
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="12" y1="3" x2="12" y2="21" /><rect x="5" y="5" width="14" height="4" rx="1" /><rect x="7" y="15" width="10" height="4" rx="1" /></svg>,
            onClick: () => alignSelectedNodes("center"),
        },
        {
            title: "Align Right",
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="21" y1="3" x2="21" y2="21" /><rect x="3" y="5" width="14" height="4" rx="1" /><rect x="11" y="15" width="10" height="4" rx="1" /></svg>,
            onClick: () => alignSelectedNodes("right"),
        },
        {
            title: "Align Top",
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="3" x2="21" y2="3" /><rect x="5" y="7" width="4" height="14" rx="1" /><rect x="15" y="7" width="4" height="10" rx="1" /></svg>,
            onClick: () => alignSelectedNodes("top"),
        },
        {
            title: "Align Middle",
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="12" x2="21" y2="12" /><rect x="5" y="5" width="4" height="14" rx="1" /><rect x="15" y="7" width="4" height="10" rx="1" /></svg>,
            onClick: () => alignSelectedNodes("middle"),
        },
        {
            title: "Align Bottom",
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><line x1="3" y1="21" x2="21" y2="21" /><rect x="5" y="3" width="4" height="14" rx="1" /><rect x="15" y="11" width="4" height="10" rx="1" /></svg>,
            onClick: () => alignSelectedNodes("bottom"),
        },
    ];

    const distributeTools = [
        {
            title: "Distribute Horizontal",
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="2" y="5" width="4" height="14" rx="1" /><rect x="18" y="5" width="4" height="14" rx="1" /><line x1="12" y1="5" x2="12" y2="19" /></svg>,
            onClick: () => distributeSelectedNodes("horizontal"),
        },
        {
            title: "Distribute Vertical",
            icon: <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><rect x="5" y="2" width="14" height="4" rx="1" /><rect x="5" y="18" width="14" height="4" rx="1" /><line x1="5" y1="12" x2="19" y2="12" /></svg>,
            onClick: () => distributeSelectedNodes("vertical"),
        },
    ];

    return (
        <div style={{
            position: "fixed", bottom: "28px", left: "50%", transform: "translateX(-50%)",
            display: "flex", alignItems: "center", gap: "4px",
            background: "rgba(54, 57, 63, 0.8)", border: "none", backdropFilter: "blur(20px)",
            borderRadius: "9999px", padding: "6px 10px",
            boxShadow: "0 10px 40px rgba(192, 193, 255, 0.08)",
            zIndex: 40, fontFamily: "Inter, sans-serif",
        }}>
            {toolItems.map((item, i) => (
                <button
                    key={i}
                    id={(item as any).id}
                    title={item.title}
                    onClick={item.onClick}
                    disabled={item.disabled}
                    style={{
                        background: "transparent", border: "none",
                        cursor: item.disabled ? "not-allowed" : "pointer",
                        color: item.disabled
                            ? "#464554" // outline_variant
                            : item.danger ? "#f87171" 
                            : item.ai && !isExpanding ? "#cebdff" // tertiary
                            : "#e0e2ea", // on_surface
                        padding: "8px", borderRadius: "9999px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background 0.15s, color 0.15s, box-shadow 0.15s",
                        opacity: item.disabled ? 0.45 : 1,
                    }}
                    onMouseEnter={(e) => {
                        if (item.disabled) return;
                        (e.currentTarget as HTMLButtonElement).style.background = "#31353b"; // surface_container_highest
                        (e.currentTarget as HTMLButtonElement).style.color = item.danger ? "#ef4444" : item.ai ? "#cebdff" : "#ffffff";
                    }}
                    onMouseLeave={(e) => {
                        if (item.disabled) return;
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.color = item.danger ? "#f87171" : item.ai && !isExpanding ? "#cebdff" : "#e0e2ea";
                    }}
                >
                    {item.icon}
                </button>
            ))}

            {selectedNodeIds.size > 1 && (
                <>
                    <div style={{ width: "1px", height: "20px", background: "#334155", margin: "0 6px" }} />
                    {alignTools.map((item, i) => (
                        <button
                            key={"align-" + i}
                            title={item.title}
                            onClick={item.onClick}
                            style={{
                                background: "transparent", border: "none",
                                cursor: "pointer", color: "#9ca3af",
                                padding: "8px", borderRadius: "9px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "background 0.15s, color 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = "#31353b";
                                (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                (e.currentTarget as HTMLButtonElement).style.color = "#e0e2ea";
                            }}
                        >
                            {item.icon}
                        </button>
                    ))}
                </>
            )}

            {selectedNodeIds.size > 2 && (
                <>
                    <div style={{ width: "1px", height: "20px", background: "#334155", margin: "0 6px" }} />
                    {distributeTools.map((item, i) => (
                        <button
                            key={"dist-" + i}
                            title={item.title}
                            onClick={item.onClick}
                            style={{
                                background: "transparent", border: "none",
                                cursor: "pointer", color: "#9ca3af",
                                padding: "8px", borderRadius: "9px",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                transition: "background 0.15s, color 0.15s",
                            }}
                            onMouseEnter={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = "#31353b";
                                (e.currentTarget as HTMLButtonElement).style.color = "#ffffff";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                (e.currentTarget as HTMLButtonElement).style.color = "#e0e2ea";
                            }}
                        >
                            {item.icon}
                        </button>
                    ))}
                </>
            )}
        </div>
    );
}
