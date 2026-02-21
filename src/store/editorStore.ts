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
    collapsed?: boolean;
}

interface EditorState {
    nodes: NodeType[];
    selectedNodeIds: Set<string>;
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

    /** 
     * Select a node. 
     * @param id The node ID.
     * @param multi If true (Shift key), toggle selection. If false, exclusive select.
     */
    selectNode: (id: string, multi?: boolean) => void;

    /** Select multiple nodes (e.g. Lasso) */
    selectNodes: (ids: string[], multi?: boolean) => void;

    deselectAll: () => void;

    createNode: (
        mindMapId: string,
        parent: NodeType
    ) => Promise<void>;

    /** Called by the drag engine on mouseup with the final position. */
    commitDragEnd: (id: string, x: number, y: number) => Promise<void>;
    commitBatchDragEnd: (updates: { id: string; x: number; y: number }[]) => Promise<void>;
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
    toggleNodeCollapse: (id: string) => void;

    deleteSelectedNodes: () => Promise<void>;
    // Legacy single delete for compatibility refactor if needed (prefer deleteSelectedNodes)
    deleteNode: (id: string) => Promise<void>;

    autoLayout: () => Promise<void>;

    fitToScreen: () => void;

    pushHistory: () => void;
    undo: () => Promise<void>;
    redo: () => Promise<void>;
}

export const useEditorStore = create<EditorState>((set, get) => ({
    nodes: [],
    selectedNodeIds: new Set(),
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

    selectNode: (id, multi = false) => {
        set((state) => {
            const newSet = new Set(multi ? state.selectedNodeIds : []);
            if (multi && newSet.has(id)) {
                newSet.delete(id);
            } else {
                newSet.add(id);
            }
            return { selectedNodeIds: newSet };
        });
    },

    selectNodes: (ids, multi = false) => {
        set((state) => {
            const newSet = new Set(multi ? state.selectedNodeIds : []);
            ids.forEach(id => newSet.add(id));
            return { selectedNodeIds: newSet };
        });
    },

    deselectAll: () => set({ selectedNodeIds: new Set() }),

    createNode: async (mindMapId, parent) => {
        const res = await api.post("/mindmaps/nodes", {
            mindMapId,
            parentId: parent._id,
            x: parent.x + 200,
            y: parent.y,
        });

        const newNode = res.data;
        set({
            nodes: [...get().nodes, newNode],
            selectedNodeIds: new Set([newNode._id]) // Auto-select new node
        });
        get().pushHistory();
    },

    commitDragEnd: async (id, x, y) => {
        // Single node commit (legacy or specific use)
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

    commitBatchDragEnd: async (updates) => {
        // Optimistic update for all
        set({
            nodes: get().nodes.map((n) => {
                const update = updates.find(u => u.id === n._id);
                return update ? { ...n, x: update.x, y: update.y } : n;
            }),
        });

        // Sync all to backend
        // In a real app, might want a batch API endpoint. For now, loop requests (or use Promise.all)
        try {
            await Promise.all(updates.map(u => api.patch(`/mindmaps/nodes/${u.id}`, { x: u.x, y: u.y })));
            get().pushHistory();
        } catch (err) {
            console.error("Failed to save batch positions:", err);
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
        // Legacy wrapper: delete just this one
        // In new model, we should prefer deleteSelectedNodes if id matches selection
        try {
            await api.delete(`/mindmaps/nodes/${id}`);
            set({
                nodes: get().nodes.filter((n) => n._id !== id && n.parentId !== id),
                selectedNodeIds: new Set(),
            });
            get().pushHistory();
        } catch (err) {
            console.error("Failed to delete node:", err);
        }
    },

    deleteSelectedNodes: async () => {
        const { selectedNodeIds, nodes } = get();
        if (selectedNodeIds.size === 0) return;

        const idsToDelete = Array.from(selectedNodeIds);

        try {
            // Ideally a batch delete API, else loop
            await Promise.all(idsToDelete.map(id => api.delete(`/mindmaps/nodes/${id}`)));

            // Filter out deleted nodes AND their children
            // Note: If we delete a parent, children are usually deleted by backend cascade or we must do it.
            // Assuming simplified client-side filter for now:

            // To be safe, let's fetch fresh? Or just filter carefully.
            // If backend cascades, we just need to remove them from local state.
            // Let's assume manual recursion in state update for now.

            // Note: simple filter might leave orphans if backend doesn't cascade. 
            // Better to re-fetch or trust backend cascade. 
            // For now, removing exact IDs + children of those IDs from state.

            const toRemove = new Set(idsToDelete);
            let changed = true;
            while (changed) {
                changed = false;
                nodes.forEach(n => {
                    if (n.parentId && toRemove.has(n.parentId) && !toRemove.has(n._id)) {
                        toRemove.add(n._id);
                        changed = true;
                    }
                });
            }

            set({
                nodes: nodes.filter(n => !toRemove.has(n._id)),
                selectedNodeIds: new Set(),
            });
            get().pushHistory();
        } catch (err) {
            console.error("Failed to delete nodes:", err);
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

    toggleNodeCollapse: (id) => {
        set((state) => {
            const nodeIndex = state.nodes.findIndex((n) => n._id === id);
            if (nodeIndex === -1) return {};

            const node = state.nodes[nodeIndex];
            // Toggle collapsed state (undefined -> true, true -> false, false -> true)
            const newCollapsed = !node.collapsed;

            const newNodes = [...state.nodes];
            newNodes[nodeIndex] = { ...node, collapsed: newCollapsed };

            let newSelectedIds = state.selectedNodeIds;

            // If collapsing, deselect all descendants
            if (newCollapsed) {
                const descendantIds = new Set<string>();

                // Helper to find descendants
                const findDescendants = (parentId: string) => {
                    const children = newNodes.filter(n => n.parentId === parentId);
                    for (const child of children) {
                        descendantIds.add(child._id);
                        findDescendants(child._id);
                    }
                };
                findDescendants(id);

                // If any selected node is a descendant, remove it
                let intersection = false;
                descendantIds.forEach(descId => {
                    if (newSelectedIds.has(descId)) intersection = true;
                });

                if (intersection) {
                    newSelectedIds = new Set(state.selectedNodeIds);
                    descendantIds.forEach(descId => newSelectedIds.delete(descId));
                }
            }

            return {
                nodes: newNodes,
                selectedNodeIds: newSelectedIds
            };
        });
    },

    pushHistory: () => {
        const { nodes } = get();
        set((state) => {
            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newHistory.push(JSON.parse(JSON.stringify(nodes)));
            // Limit to 50 items
            if (newHistory.length > 50) {
                newHistory.shift();
                return {
                    history: newHistory,
                    // historyIndex stays at length-1 (49)
                    historyIndex: newHistory.length - 1
                };
            }
            return {
                history: newHistory,
                historyIndex: newHistory.length - 1,
            };
        });
    },
    undo: async () => {
        const { history, historyIndex } = get();
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            set({
                nodes: history[newIndex],
                historyIndex: newIndex,
                selectedNodeIds: new Set(), // clear selection on undo
            });
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

