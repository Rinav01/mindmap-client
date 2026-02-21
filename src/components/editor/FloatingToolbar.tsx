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
        </div>
    );
}
