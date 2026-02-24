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
            title: "Link (coming soon)",
            icon: (
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
                    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
                </svg>
            ),
            onClick: undefined,
            disabled: true,
        },
        {
            title: selectedNode ? "Edit node text" : "Select a node first",
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
            background: "#1e293b", border: "1px solid #334155",
            borderRadius: "14px", padding: "6px 10px",
            boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
            zIndex: 40, fontFamily: "Inter, sans-serif",
        }}>
            {toolItems.map((item, i) => (
                <button
                    key={i}
                    title={item.title}
                    onClick={item.onClick}
                    disabled={item.disabled}
                    style={{
                        background: "transparent", border: "none",
                        cursor: item.disabled ? "not-allowed" : "pointer",
                        color: item.disabled
                            ? "#4b5563"
                            : item.danger ? "#f87171" : "#9ca3af",
                        padding: "8px", borderRadius: "9px",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        transition: "background 0.15s, color 0.15s",
                        opacity: item.disabled ? 0.45 : 1,
                    }}
                    onMouseEnter={(e) => {
                        if (item.disabled) return;
                        (e.currentTarget as HTMLButtonElement).style.background = "#334155";
                        (e.currentTarget as HTMLButtonElement).style.color = item.danger ? "#ef4444" : "white";
                    }}
                    onMouseLeave={(e) => {
                        if (item.disabled) return;
                        (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                        (e.currentTarget as HTMLButtonElement).style.color = item.danger ? "#f87171" : "#9ca3af";
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
                                (e.currentTarget as HTMLButtonElement).style.background = "#334155";
                                (e.currentTarget as HTMLButtonElement).style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
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
                                (e.currentTarget as HTMLButtonElement).style.background = "#334155";
                                (e.currentTarget as HTMLButtonElement).style.color = "white";
                            }}
                            onMouseLeave={(e) => {
                                (e.currentTarget as HTMLButtonElement).style.background = "transparent";
                                (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af";
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
