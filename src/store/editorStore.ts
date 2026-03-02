import { create } from "zustand";
import { api } from "../services/api";
import { performAnimatedLayoutChange } from "../engine/motionEngine";
import { socketService } from "../services/socket";

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

export interface LiveCursor {
    x: number;
    y: number;
    name: string;
    color: string;
}

export interface MindMapVersion {
    _id: string;
    label: string;
    actionType: "manual" | "auto-layout" | "align" | "delete" | "restore";
    createdAt: string;
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
    deletingNodeIds: Set<string>;
    color?: string;
    fontSize?: number;
    mapTitle: string;
    isLayoutAnimating: boolean;

    loadNodes: (mindMapId: string) => Promise<void>;
    setMapTitle: (mindMapId: string, title: string) => Promise<void>;
    selectNode: (id: string, multi?: boolean) => void;
    selectNodes: (ids: string[], multi?: boolean) => void;
    deselectAll: () => void;
    createNode: (mindMapId: string, parent: NodeType) => Promise<void>;
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
    deleteNode: (id: string) => Promise<void>;
    autoLayout: () => Promise<void>;
    fitToScreen: () => void;
    pushHistory: () => void;
    undo: () => Promise<void>;
    redo: () => Promise<void>;
    alignSelectedNodes: (type: "left" | "center" | "right" | "top" | "middle" | "bottom") => Promise<void>;
    distributeSelectedNodes: (axis: "horizontal" | "vertical") => Promise<void>;
    reparentNodes: (nodeIds: string[], newParentId: string) => Promise<void>;
    setLayoutAnimating: (busy: boolean) => void;
    versions: MindMapVersion[];
    currentVersionId: string | null;
    loadVersions: (mindMapId: string) => Promise<void>;
    createSnapshot: (mindMapId: string, name: string) => Promise<void>;
    restoreVersion: (mindMapId: string, versionId: string) => Promise<void>;
    deleteVersion: (mindMapId: string, versionId: string) => Promise<void>;

    liveCursors: Record<string, LiveCursor>;
    updateLiveCursor: (id: string, data: LiveCursor) => void;
    removeLiveCursor: (id: string) => void;

    applyRemoteNodeCreated: (node: NodeType) => void;
    applyRemoteNodeUpdated: (id: string, updates: Partial<NodeType>) => void;
    applyRemoteNodesUpdated: (updates: { id: string; x: number; y: number }[]) => void;
    applyRemoteNodeDeleted: (id: string) => void;
    applyRemoteNodesDeleted: (ids: string[]) => void;
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
    deletingNodeIds: new Set(),
    editingNodeId: null,
    mapTitle: "",
    isLayoutAnimating: false,
    versions: [],
    currentVersionId: null,
    liveCursors: {},

    loadNodes: async (mindMapId) => {
        const [nodesRes, mapRes] = await Promise.all([
            api.get(`/mindmaps/${mindMapId}/nodes`),
            api.get(`/mindmaps/${mindMapId}`),
        ]);

        const rawNodes = nodesRes.data || [];
        const normalizedNodes: NodeType[] = rawNodes.map(normalizeNode);

        set({ nodes: normalizedNodes, mapTitle: mapRes.data?.title ?? "" });
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

        const newNode = normalizeNode(res.data);
        set({
            nodes: [...get().nodes, newNode],
            selectedNodeIds: new Set([newNode._id])
        });
        get().pushHistory();
        socketService.emitNodeAdded(newNode);
    },

    commitDragEnd: async (id, x, y) => {
        set({
            nodes: get().nodes.map((n) =>
                n._id === id ? { ...n, x, y } : n
            ),
        });
        try {
            await api.patch(`/mindmaps/nodes/${id}`, { x, y });
            get().pushHistory();
            socketService.emitNodeDragged(id, x, y);
        } catch (err) {
            console.error("Failed to save node position:", err);
        }
    },

    commitBatchDragEnd: async (updates) => {
        set({
            nodes: get().nodes.map((n) => {
                const update = updates.find(u => u.id === n._id);
                return update ? { ...n, x: update.x, y: update.y } : n;
            }),
        });
        try {
            await Promise.all(updates.map(u => api.patch(`/mindmaps/nodes/${u.id}`, { x: u.x, y: u.y })));
            get().pushHistory();
            socketService.emitNodesUpdated(updates);
        } catch (err) {
            console.error("Failed to save batch positions:", err);
        }
    },

    updateNodeColor: async (id, color) => {
        set({
            nodes: get().nodes.map((n) =>
                n._id === id ? { ...n, color } : n
            ),
        });
        try {
            await api.patch(`/mindmaps/nodes/${id}`, { color });
            socketService.emitNodeUpdated(id, { color });
        } catch (err) {
            console.error("Failed to save node color:", err);
        }
    },

    updateNodeFontSize: async (id, fontSize) => {
        set({
            nodes: get().nodes.map((n) =>
                n._id === id ? { ...n, fontSize } : n
            ),
        });
        try {
            await api.patch(`/mindmaps/nodes/${id}`, { fontSize });
            socketService.emitNodeUpdated(id, { fontSize });
        } catch (err) {
            console.error("Failed to save node font size:", err);
        }
    },

    setZoom: (zoom) => {
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
            socketService.emitNodeUpdated(id, { text });
        } catch (err) {
            console.error("Failed to update node text:", err);
        }
    },

    cancelEditing: () => set({ editingNodeId: null }),

    deleteNode: async (id) => {
        set((state) => {
            const newDeleting = new Set(state.deletingNodeIds);
            newDeleting.add(id);
            return { deletingNodeIds: newDeleting };
        });
        await new Promise((resolve) => setTimeout(resolve, 300));
        try {
            await api.delete(`/mindmaps/nodes/${id}`);
            set((state) => {
                const newDeleting = new Set(state.deletingNodeIds);
                newDeleting.delete(id);
                return {
                    nodes: state.nodes.filter((n) => n._id !== id && n.parentId !== id),
                    selectedNodeIds: new Set(),
                    deletingNodeIds: newDeleting
                };
            });
            get().pushHistory();
            socketService.emitNodeDeleted(id);
        } catch (err) {
            console.error("Failed to delete node:", err);
            set((state) => {
                const newDeleting = new Set(state.deletingNodeIds);
                newDeleting.delete(id);
                return { deletingNodeIds: newDeleting };
            });
        }
    },

    deleteSelectedNodes: async () => {
        const { selectedNodeIds, nodes } = get();
        if (selectedNodeIds.size === 0) return;
        const idsToDelete = Array.from(selectedNodeIds);
        set((state) => {
            const newDeleting = new Set(state.deletingNodeIds);
            idsToDelete.forEach(id => newDeleting.add(id));
            return { deletingNodeIds: newDeleting };
        });
        await new Promise((resolve) => setTimeout(resolve, 300));
        try {
            await Promise.all(idsToDelete.map(id => api.delete(`/mindmaps/nodes/${id}`)));
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
            set((state) => {
                const newDeleting = new Set(state.deletingNodeIds);
                idsToDelete.forEach(id => newDeleting.delete(id));
                return {
                    nodes: state.nodes.filter(n => !toRemove.has(n._id)),
                    selectedNodeIds: new Set(),
                    deletingNodeIds: newDeleting
                };
            });
            get().pushHistory();
            socketService.emitNodesDeleted(Array.from(toRemove));
        } catch (err) {
            console.error("Failed to delete nodes:", err);
            set((state) => {
                const newDeleting = new Set(state.deletingNodeIds);
                idsToDelete.forEach(id => newDeleting.delete(id));
                return { deletingNodeIds: newDeleting };
            });
        }
    },

    autoLayout: async () => {
        const { nodes } = get();
        if (nodes.length === 0) return;

        // Defensive normalization for IDs and Coordinates
        const normalizedNodes: NodeType[] = nodes.map(normalizeNode);

        const nodeIds = new Set(normalizedNodes.map(n => n._id));
        const roots = normalizedNodes.filter(n => !n.parentId || !nodeIds.has(n.parentId));

        let allPositioned: NodeType[] = [];
        let subtreeYOffset = 0;
        const SUBTREE_GAP = 200;
        const sortedRoots = [...roots].sort((a, b) => a.y - b.y);

        for (const root of sortedRoots) {
            const anchorY = allPositioned.length === 0 ? root.y : subtreeYOffset;
            const positionedSubtree = calculateTreeLayout(normalizedNodes, root, root.x, anchorY);
            allPositioned = [...allPositioned, ...positionedSubtree];
            const maxY = Math.max(...positionedSubtree.map(n => n.y));
            subtreeYOffset = maxY + SUBTREE_GAP;
        }

        const positionedIds = new Set(allPositioned.map(n => n._id));
        normalizedNodes.forEach(n => {
            if (!positionedIds.has(n._id)) allPositioned.push(n);
        });

        await performAnimatedLayoutChange(
            () => { set({ nodes: allPositioned }); },
            () => get().setLayoutAnimating(true),
            () => get().setLayoutAnimating(false)
        );

        try {
            await Promise.all(allPositioned.map(node =>
                api.patch(`/mindmaps/nodes/${node._id}`, { x: node.x, y: node.y })
            ));
            get().pushHistory();
            socketService.emitNodesUpdated(
                allPositioned.map((node) => ({ id: node._id, x: node.x, y: node.y }))
            );
        } catch (err) {
            console.error("[AutoLayout] Failed to apply:", err);
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
        const vpH = window.innerHeight - 52;
        const scaleX = (vpW - PADDING * 2) / contentW;
        const scaleY = (vpH - PADDING * 2) / contentH;
        const newZoom = Math.min(Math.max(Math.min(scaleX, scaleY), 0.1), 2);
        const panX = (vpW / 2) - ((minX + contentW / 2) * newZoom);
        const panY = (vpH / 2) - ((minY + contentH / 2) * newZoom) + 52;
        set({ zoom: newZoom, panOffset: { x: panX, y: panY } });
    },

    toggleNodeCollapse: (id) => {
        performAnimatedLayoutChange(
            () => {
                set((state) => {
                    const nodeIndex = state.nodes.findIndex((n) => n._id === id);
                    if (nodeIndex === -1) return {};
                    const node = state.nodes[nodeIndex];
                    const newCollapsed = !node.collapsed;
                    const newNodes = [...state.nodes];
                    newNodes[nodeIndex] = { ...node, collapsed: newCollapsed };
                    let newSelectedIds = state.selectedNodeIds;
                    if (newCollapsed) {
                        const descendantIds = new Set<string>();
                        const findDescendants = (parentId: string) => {
                            const children = newNodes.filter(n => n.parentId === parentId);
                            for (const child of children) {
                                descendantIds.add(child._id);
                                findDescendants(child._id);
                            }
                        };
                        findDescendants(id);
                        let intersection = false;
                        descendantIds.forEach(descId => {
                            if (newSelectedIds.has(descId)) intersection = true;
                        });
                        if (intersection) {
                            newSelectedIds = new Set(state.selectedNodeIds);
                            descendantIds.forEach(descId => newSelectedIds.delete(descId));
                        }
                    }
                    return { nodes: newNodes, selectedNodeIds: newSelectedIds };
                });
            },
            () => get().setLayoutAnimating(true),
            () => get().setLayoutAnimating(false)
        );

        socketService.emitNodeUpdated(id, { collapsed: !get().nodes.find(n => n._id === id)?.collapsed });
    },

    pushHistory: () => {
        const { nodes } = get();
        set((state) => {
            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newHistory.push(JSON.parse(JSON.stringify(nodes)));
            if (newHistory.length > 50) {
                newHistory.shift();
                return { history: newHistory, historyIndex: newHistory.length - 1 };
            }
            return { history: newHistory, historyIndex: newHistory.length - 1 };
        });
    },
    undo: async () => {
        await performAnimatedLayoutChange(
            async () => {
                const { history, historyIndex } = get();
                if (historyIndex > 0) {
                    const newIndex = historyIndex - 1;
                    set({
                        nodes: history[newIndex],
                        historyIndex: newIndex,
                        selectedNodeIds: new Set(),
                    });
                }
            },
            () => get().setLayoutAnimating(true),
            () => get().setLayoutAnimating(false)
        );
    },
    redo: async () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;
        const newIndex = historyIndex + 1;
        const snapshot = history[newIndex];
        await performAnimatedLayoutChange(
            () => {
                set({ nodes: JSON.parse(JSON.stringify(snapshot)), historyIndex: newIndex });
            },
            () => get().setLayoutAnimating(true),
            () => get().setLayoutAnimating(false)
        );
        try {
            await Promise.all(snapshot.map(node =>
                api.patch(`/mindmaps/nodes/${node._id}`, {
                    x: node.x, y: node.y, text: node.text
                })
            ));
            socketService.emitNodesUpdated(
                snapshot.map(node => ({ id: node._id, x: node.x, y: node.y }))
            );
        } catch (err) {
            console.error("Failed to redo sync:", err);
        }
    },

    alignSelectedNodes: async (type) => {
        const { selectedNodeIds, nodes } = get();
        if (selectedNodeIds.size < 2) return;
        const NODE_W = 160;
        const NODE_H = 44;
        const selectedNodes = nodes.filter(n => selectedNodeIds.has(n._id));
        let target: number;
        switch (type) {
            case "left": target = Math.min(...selectedNodes.map(n => n.x)); break;
            case "center": target = selectedNodes.reduce((sum, n) => sum + n.x + NODE_W / 2, 0) / selectedNodes.length; break;
            case "right": target = Math.max(...selectedNodes.map(n => n.x + NODE_W)); break;
            case "top": target = Math.min(...selectedNodes.map(n => n.y)); break;
            case "middle": target = selectedNodes.reduce((sum, n) => sum + n.y + NODE_H / 2, 0) / selectedNodes.length; break;
            case "bottom": target = Math.max(...selectedNodes.map(n => n.y + NODE_H)); break;
            default: target = 0;
        }
        const updates = selectedNodes.map(n => {
            let x = n.x, y = n.y;
            if (type === "left") x = target;
            else if (type === "center") x = target - NODE_W / 2;
            else if (type === "right") x = target - NODE_W;
            else if (type === "top") y = target;
            else if (type === "middle") y = target - NODE_H / 2;
            else if (type === "bottom") y = target - NODE_H;
            return { id: n._id, x, y };
        });
        await performAnimatedLayoutChange(
            () => {
                set({
                    nodes: get().nodes.map((n) => {
                        const update = updates.find(u => u.id === n._id);
                        return update ? { ...n, x: update.x, y: update.y } : n;
                    }),
                });
            },
            () => get().setLayoutAnimating(true),
            () => get().setLayoutAnimating(false)
        );
        get().commitBatchDragEnd(updates);
    },

    distributeSelectedNodes: async (axis) => {
        const { selectedNodeIds, nodes } = get();
        if (selectedNodeIds.size < 3) return;
        const NODE_W = 160;
        const NODE_H = 44;
        const selectedNodes = nodes.filter(n => selectedNodeIds.has(n._id));
        const updates: { id: string; x: number; y: number }[] = [];
        if (axis === "horizontal") {
            const sortedNodes = [...selectedNodes].sort((a, b) => a.x - b.x);
            const first = sortedNodes[0];
            const last = sortedNodes[sortedNodes.length - 1];
            const totalWidth = (last.x + NODE_W) - first.x;
            const gap = (totalWidth - sortedNodes.length * NODE_W) / (sortedNodes.length - 1);
            sortedNodes.forEach((node, i) => {
                updates.push({ id: node._id, x: first.x + i * (NODE_W + gap), y: node.y });
            });
        } else {
            const sortedNodes = [...selectedNodes].sort((a, b) => a.y - b.y);
            const first = sortedNodes[0];
            const last = sortedNodes[sortedNodes.length - 1];
            const totalHeight = (last.y + NODE_H) - first.y;
            const gap = (totalHeight - sortedNodes.length * NODE_H) / (sortedNodes.length - 1);
            sortedNodes.forEach((node, i) => {
                updates.push({ id: node._id, x: node.x, y: first.y + i * (NODE_H + gap) });
            });
        }
        await performAnimatedLayoutChange(
            () => {
                set({
                    nodes: get().nodes.map((n) => {
                        const update = updates.find(u => u.id === n._id);
                        return update ? { ...n, x: update.x, y: update.y } : n;
                    }),
                });
            },
            () => get().setLayoutAnimating(true),
            () => get().setLayoutAnimating(false)
        );
        get().commitBatchDragEnd(updates);
    },

    reparentNodes: async (nodeIds, newParentId) => {
        const { nodes } = get();
        await performAnimatedLayoutChange(
            () => {
                set({ nodes: nodes.map(n => nodeIds.includes(n._id) ? { ...n, parentId: newParentId } : n) });
            },
            () => get().setLayoutAnimating(true),
            () => get().setLayoutAnimating(false)
        );
        try {
            await Promise.all(nodeIds.map(id => api.patch(`/mindmaps/nodes/${id}`, { parentId: newParentId })));
            get().pushHistory();
            nodeIds.forEach(id => socketService.emitNodeUpdated(id, { parentId: newParentId }));
        } catch (err) {
            console.error("Failed to reparent nodes:", err);
        }
    },
    setLayoutAnimating: (isLayoutAnimating) => set({ isLayoutAnimating }),
    loadVersions: async (mindMapId) => {
        try {
            const res = await api.get(`/mindmaps/${mindMapId}/versions`);
            set({ versions: res.data });
        } catch (err) {
            console.error("Failed to load versions:", err);
        }
    },
    createSnapshot: async (mindMapId, name) => {
        try {
            await api.post(`/mindmaps/${mindMapId}/versions`, { label: name, actionType: "manual" });
            get().loadVersions(mindMapId);
        } catch (err) {
            console.error("Failed to create snapshot:", err);
        }
    },
    deleteVersion: async (mindMapId, versionId) => {
        try {
            await api.delete(`/mindmaps/${mindMapId}/versions/${versionId}`);
            set((state) => ({
                versions: state.versions.filter((v) => v._id !== versionId),
                currentVersionId: state.currentVersionId === versionId ? null : state.currentVersionId,
            }));
        } catch (err) {
            console.error("Failed to delete version:", err);
        }
    },
    restoreVersion: async (mindMapId, versionId) => {
        try {
            const res = await api.post(`/mindmaps/${mindMapId}/versions/${versionId}/restore`);

            // Handle different possible response formats
            let restoredNodes: unknown[] | null = null;
            if (Array.isArray(res.data)) {
                restoredNodes = res.data;
            } else if (res.data && Array.isArray(res.data.nodes)) {
                restoredNodes = res.data.nodes;
            }

            if (restoredNodes) {
                // Defensive normalization: Ensure all IDs are strings and coordinates are numbers
                const normalizedNodes: NodeType[] = restoredNodes.map(normalizeNode);

                await performAnimatedLayoutChange(
                    () => { set({ nodes: normalizedNodes, selectedNodeIds: new Set(), currentVersionId: versionId }); },
                    () => get().setLayoutAnimating(true),
                    () => get().setLayoutAnimating(false)
                );
                get().pushHistory();
            } else {
                console.warn("[Version] No nodes found in restore response. Triggering manual reload.");
                // Fallback: reload nodes if restore response doesn't contain them
                await get().loadNodes(mindMapId);
            }
        } catch (err) {
            console.error("[Version] Failed to restore version:", err);
        }
    },

    // --- Remote Change Handlers ---
    updateLiveCursor: (id, data) => set((state) => ({
        liveCursors: { ...state.liveCursors, [id]: data }
    })),

    removeLiveCursor: (id) => set((state) => {
        const newCursors = { ...state.liveCursors };
        delete newCursors[id];
        return { liveCursors: newCursors };
    }),

    applyRemoteNodeCreated: (node) => {
        set((state) => ({ nodes: [...state.nodes, node] }));
    },

    applyRemoteNodeUpdated: (id, updates) => {
        set((state) => ({
            nodes: state.nodes.map((n) => (n._id === id ? { ...n, ...updates } : n)),
        }));
    },

    applyRemoteNodesUpdated: (updates) => {
        set((state) => ({
            nodes: state.nodes.map((n) => {
                const up = updates.find(u => u.id === n._id);
                return up ? { ...n, ...up } : n;
            }),
        }));
    },

    applyRemoteNodeDeleted: (id) => {
        set((state) => ({
            nodes: state.nodes.filter((n) => n._id !== id && n.parentId !== id),
        }));
    },

    applyRemoteNodesDeleted: (ids) => {
        const idSet = new Set(ids);
        set((state) => ({
            nodes: state.nodes.filter((n) => !idSet.has(n._id)),
        }));
    },
}));

function normalizeNode(n: unknown): NodeType {
    const getVal = (v: unknown) => {
        if (v === null || v === undefined) return null;
        if (typeof v === 'string') return v;
        if (typeof v === 'object' && v !== null) {
            const obj = v as { $oid?: string; _id?: { $oid?: string } | string; id?: { $oid?: string } | string };
            if (obj.$oid) return String(obj.$oid);
            if (obj._id) return String(typeof obj._id === 'object' ? obj._id.$oid : obj._id);
            if (obj.id) return String(typeof obj.id === 'object' ? obj.id.$oid : obj.id);
            return String(v);
        }
        return String(v);
    };

    const nodeRecord = n as Record<string, unknown>;
    const id = getVal(nodeRecord._id);
    let pid = getVal(nodeRecord.parentId);

    if (pid === "null" || pid === "undefined" || pid === "") pid = null;
    if (id === pid) pid = null;

    return {
        ...(nodeRecord as Partial<NodeType>),
        _id: id ?? String(Math.random()), // Fallback for ID safety
        parentId: pid,
        x: Number(nodeRecord.x) || 0,
        y: Number(nodeRecord.y) || 0,
    } as NodeType;
}

function calculateTreeLayout(nodes: NodeType[], rootNode: NodeType, anchorX: number, anchorY: number): NodeType[] {
    const positioned: NodeType[] = [];
    const HORIZONTAL_SPACING = 200;
    const VERTICAL_SPACING = 100;

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
        const y = yOffset + ((totalHeight - 1) * VERTICAL_SPACING) / 2;
        positioned.push({ ...node, x, y });
        return totalHeight;
    }

    layoutNode(rootNode, 0, anchorY);
    const rootAfter = positioned.find(n => n._id === rootNode._id);
    if (rootAfter) {
        const dx = anchorX - rootAfter.x;
        const dy = anchorY - rootAfter.y;
        positioned.forEach(n => {
            n.x += dx;
            n.y += dy;
        });
    }
    return positioned;
}
