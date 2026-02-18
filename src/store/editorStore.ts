import { create } from "zustand";
import { api } from "../services/api";

export interface NodeType {
    _id: string;
    text: string;
    x: number;
    y: number;
    parentId: string | null;
    color?: string;
    fontSize?: number;
}

interface EditorState {
    nodes: NodeType[];
    selectedNodeId: string | null;
    zoom: number;
    panOffset: { x: number; y: number };
    isPanning: boolean;
    isPanMode: boolean;
    editingNodeId: string | null;
    history: NodeType[][];
    historyIndex: number;
    color?: string;
    fontSize?: number;
    mapTitle: string;

    loadNodes: (mindMapId: string) => Promise<void>;
    setMapTitle: (mindMapId: string, title: string) => Promise<void>;
    selectNode: (id: string) => void;

    createNode: (
        mindMapId: string,
        parent: NodeType
    ) => Promise<void>;

    /** Called by the drag engine on mouseup with the final position. */
    commitDragEnd: (id: string, x: number, y: number) => Promise<void>;
    setZoom: (zoom: number) => void;

    startPan: () => void;
    updatePan: (deltaX: number, deltaY: number) => void;
    endPan: () => void;
    togglePanMode: () => void;
    setIsPanMode: (active: boolean) => void;

    startEditing: (id: string) => void;
    updateNodeText: (id: string, text: string) => Promise<void>;
    updateNodeColor: (id: string, color: string) => Promise<void>;
    updateNodeFontSize: (id: string, fontSize: number) => Promise<void>;
    cancelEditing: () => void;

    deleteNode: (id: string) => Promise<void>;

    autoLayout: () => Promise<void>;

    fitToScreen: () => void;

    pushHistory: () => void;
    undo: () => Promise<void>;
    redo: () => Promise<void>;
}

export const useEditorStore = create<EditorState>((set, get) => ({
    nodes: [],
    selectedNodeId: null,
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    isPanning: false,
    isPanMode: false,
    history: [],
    historyIndex: -1,
    editingNodeId: null,
    mapTitle: "",

    loadNodes: async (mindMapId) => {
        const [nodesRes, mapRes] = await Promise.all([
            api.get(`/mindmaps/${mindMapId}/nodes`),
            api.get(`/mindmaps/${mindMapId}`),
        ]);
        set({ nodes: nodesRes.data, mapTitle: mapRes.data?.title ?? "" });
    },

    setMapTitle: async (mindMapId, title) => {
        set({ mapTitle: title });
        try {
            await api.patch(`/mindmaps/${mindMapId}/title`, { title });
        } catch (err) {
            console.error("Failed to save map title:", err);
        }
    },

    selectNode: (id) => set({ selectedNodeId: id }),

    createNode: async (mindMapId, parent) => {
        const res = await api.post("/mindmaps/nodes", {
            mindMapId,
            parentId: parent._id,
            x: parent.x + 200,
            y: parent.y,
        });

        set({ nodes: [...get().nodes, res.data] });
        get().pushHistory();
    },

    commitDragEnd: async (id, x, y) => {
        // Update the store with the final position (one write)
        set({
            nodes: get().nodes.map((n) =>
                n._id === id ? { ...n, x, y } : n
            ),
        });
        try {
            await api.patch(`/mindmaps/nodes/${id}`, { x, y });
            get().pushHistory();
        } catch (err) {
            console.error("Failed to save node position:", err);
        }
    },

    updateNodeColor: async (id, color) => {
        // Optimistic update
        set({
            nodes: get().nodes.map((n) =>
                n._id === id ? { ...n, color } : n
            ),
        });
        try {
            await api.patch(`/mindmaps/nodes/${id}`, { color });
        } catch (err) {
            console.error("Failed to save node color:", err);
        }
    },

    updateNodeFontSize: async (id, fontSize) => {
        // Optimistic update
        set({
            nodes: get().nodes.map((n) =>
                n._id === id ? { ...n, fontSize } : n
            ),
        });
        try {
            await api.patch(`/mindmaps/nodes/${id}`, { fontSize });
        } catch (err) {
            console.error("Failed to save node font size:", err);
        }
    },


    setZoom: (zoom) => {
        // Clamp zoom between 0.1 and 3
        const clampedZoom = Math.max(0.1, Math.min(3, zoom));
        set({ zoom: clampedZoom });
    },

    startPan: () => set({ isPanning: true }),

    updatePan: (deltaX, deltaY) => {
        const { panOffset } = get();
        set({
            panOffset: {
                x: panOffset.x + deltaX,
                y: panOffset.y + deltaY,
            },
        });
    },

    endPan: () => set({ isPanning: false }),
    togglePanMode: () => set((state) => ({ isPanMode: !state.isPanMode })),
    setIsPanMode: (isPanMode) => set({ isPanMode }),

    startEditing: (id) => set({ editingNodeId: id }),

    updateNodeText: async (id, text) => {
        try {
            await api.patch(`/mindmaps/nodes/${id}/text`, { text });
            set({
                nodes: get().nodes.map((n) => (n._id === id ? { ...n, text } : n)),
                editingNodeId: null,
            });
            get().pushHistory();
        } catch (err) {
            console.error("Failed to update node text:", err);
        }
    },

    cancelEditing: () => set({ editingNodeId: null }),

    deleteNode: async (id) => {
        try {
            await api.delete(`/mindmaps/nodes/${id}`);
            // Filter out the deleted node and its children
            set({
                nodes: get().nodes.filter((n) => n._id !== id && n.parentId !== id),
                selectedNodeId: null,
            });
            get().pushHistory();
        } catch (err) {
            console.error("Failed to delete node:", err);
        }
    },

    autoLayout: async () => {
        const { nodes } = get();

        // Find root node (no parent)
        const root = nodes.find(n => !n.parentId);
        if (!root) return;

        // Calculate positions using tree layout
        const positioned = calculateTreeLayout(nodes, root);

        // Update all positions to backend
        try {
            for (const node of positioned) {
                await api.patch(`/mindmaps/nodes/${node._id}`, {
                    x: node.x,
                    y: node.y,
                });
            }
            set({ nodes: positioned });
        } catch (err) {
            console.error("Failed to apply auto-layout:", err);
        }
    },

    fitToScreen: () => {
        const { nodes } = get();
        if (nodes.length === 0) return;

        const NODE_W = 160;
        const NODE_H = 44;
        const PADDING = 80;

        const minX = Math.min(...nodes.map(n => n.x));
        const minY = Math.min(...nodes.map(n => n.y));
        const maxX = Math.max(...nodes.map(n => n.x + NODE_W));
        const maxY = Math.max(...nodes.map(n => n.y + NODE_H));

        const contentW = maxX - minX;
        const contentH = maxY - minY;

        const vpW = window.innerWidth;
        const vpH = window.innerHeight - 52; // minus header

        const scaleX = (vpW - PADDING * 2) / contentW;
        const scaleY = (vpH - PADDING * 2) / contentH;
        const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.1), 2);

        // Center the content
        const panX = (vpW / 2) - ((minX + contentW / 2) * newZoom);
        const panY = (vpH / 2) - ((minY + contentH / 2) * newZoom) + 52;

        set({ zoom: newZoom, panOffset: { x: panX, y: panY } });
    },

    pushHistory: () => {
        const { nodes, history, historyIndex } = get();

        // Remove any "future" history if we're not at the end
        const newHistory = history.slice(0, historyIndex + 1);

        // Add current state (deep clone)
        newHistory.push(JSON.parse(JSON.stringify(nodes)));

        // Limit to 50 items
        if (newHistory.length > 50) {
            newHistory.shift();
            set({ history: newHistory });
        } else {
            set({
                history: newHistory,
                historyIndex: historyIndex + 1,
            });
        }
    },

    undo: async () => {
        const { history, historyIndex } = get();

        if (historyIndex <= 0) return;

        const newIndex = historyIndex - 1;
        const snapshot = history[newIndex];

        // Sync to backend
        try {
            for (const node of snapshot) {
                await api.patch(`/mindmaps/nodes/${node._id}`, {
                    x: node.x,
                    y: node.y,
                    text: node.text,
                });
            }

            set({
                nodes: JSON.parse(JSON.stringify(snapshot)),
                historyIndex: newIndex,
            });
        } catch (err) {
            console.error("Failed to undo:", err);
        }
    },

    redo: async () => {
        const { history, historyIndex } = get();

        if (historyIndex >= history.length - 1) return;

        const newIndex = historyIndex + 1;
        const snapshot = history[newIndex];

        // Sync to backend
        try {
            for (const node of snapshot) {
                await api.patch(`/mindmaps/nodes/${node._id}`, {
                    x: node.x,
                    y: node.y,
                    text: node.text,
                });
            }

            set({
                nodes: JSON.parse(JSON.stringify(snapshot)),
                historyIndex: newIndex,
            });
        } catch (err) {
            console.error("Failed to redo:", err);
        }
    },
}));

// Tree layout algorithm
function calculateTreeLayout(nodes: NodeType[], root: NodeType): NodeType[] {
    const positioned: NodeType[] = [];
    const HORIZONTAL_SPACING = 200;
    const VERTICAL_SPACING = 80;

    function layoutNode(node: NodeType, depth: number, yOffset: number): number {
        const x = depth * HORIZONTAL_SPACING;
        const children = nodes.filter(n => n.parentId === node._id);

        if (children.length === 0) {
            positioned.push({ ...node, x, y: yOffset });
            return 1;
        }

        let currentY = yOffset;
        let totalHeight = 0;

        for (const child of children) {
            const childHeight = layoutNode(child, depth + 1, currentY);
            currentY += childHeight * VERTICAL_SPACING;
            totalHeight += childHeight;
        }

        // Center parent above children
        const y = yOffset + ((totalHeight - 1) * VERTICAL_SPACING) / 2;
        positioned.push({ ...node, x, y });

        return totalHeight;
    }

    layoutNode(root, 0, 0);
    return positioned;
}

