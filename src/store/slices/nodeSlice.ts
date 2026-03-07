import type { SliceCreator } from ".";
import { api } from "../../services/api";
import { performAnimatedLayoutChange } from "../../engine/motionEngine";
import { socketService } from "../../services/socket";
import type { NodeType } from "../../types/mindmap";

// ─── Pure helpers (extracted from editorStore for testability) ─────────────────

/** Normalize a raw API response object into a typed NodeType. */
export function normalizeNode(n: unknown): NodeType {
    const getVal = (v: unknown): string | null => {
        if (v === null || v === undefined) return null;
        if (typeof v === "string") return v;
        if (typeof v === "object" && v !== null) {
            const obj = v as { $oid?: string; _id?: unknown; id?: unknown };
            if (obj.$oid) return String(obj.$oid);
            if (obj._id) return String(typeof obj._id === "object" ? (obj._id as { $oid?: string }).$oid : obj._id);
            if (obj.id) return String(typeof obj.id === "object" ? (obj.id as { $oid?: string }).$oid : obj.id);
            return String(v);
        }
        return String(v);
    };

    const r = n as Record<string, unknown>;
    const id = getVal(r._id);
    let pid = getVal(r.parentId);
    if (pid === "null" || pid === "undefined" || pid === "") pid = null;
    if (id === pid) pid = null;

    return {
        ...(r as Partial<NodeType>),
        _id: id ?? String(Math.random()),
        parentId: pid,
        x: Number(r.x) || 0,
        y: Number(r.y) || 0,
    } as NodeType;
}

/** Compute a tree layout positions. Returns positioned nodes relative to anchorX/Y. */
export function calculateTreeLayout(nodes: NodeType[], rootNode: NodeType, anchorX: number, anchorY: number): NodeType[] {
    const positioned: NodeType[] = [];
    const H_GAP = 200, V_GAP = 100;

    function layoutNode(node: NodeType, depth: number, yOffset: number): number {
        const x = depth * H_GAP;
        const children = nodes.filter(n => n.parentId === node._id);
        if (children.length === 0) { positioned.push({ ...node, x, y: yOffset }); return 1; }
        let currentY = yOffset, totalHeight = 0;
        for (const child of children) {
            const h = layoutNode(child, depth + 1, currentY);
            currentY += h * V_GAP;
            totalHeight += h;
        }
        positioned.push({ ...node, x, y: yOffset + ((totalHeight - 1) * V_GAP) / 2 });
        return totalHeight;
    }

    layoutNode(rootNode, 0, anchorY);
    const rootAfter = positioned.find(n => n._id === rootNode._id);
    if (rootAfter) {
        const dx = anchorX - rootAfter.x, dy = anchorY - rootAfter.y;
        positioned.forEach(n => { n.x += dx; n.y += dy; });
    }
    return positioned;
}

// ─── Slice ────────────────────────────────────────────────────────────────────

export interface NodeSlice {
    nodes: NodeType[];

    appendNodes: (nodes: NodeType[]) => void;
    replaceNodes: (mindMapId: string) => Promise<void>;
    loadNodes: (mindMapId: string) => Promise<void>;

    createNode: (mindMapId: string, parent: NodeType) => Promise<void>;
    commitDragEnd: (id: string, x: number, y: number) => Promise<void>;
    commitBatchDragEnd: (updates: { id: string; x: number; y: number }[]) => Promise<void>;

    updateNodeText: (id: string, text: string) => Promise<void>;
    updateNodeNotes: (id: string, notes: string) => Promise<void>;
    updateNodeColor: (id: string, color: string) => Promise<void>;
    updateNodeFontSize: (id: string, fontSize: number) => Promise<void>;

    toggleNodeCollapse: (id: string) => void;
    deleteNode: (id: string) => Promise<void>;
    deleteSelectedNodes: () => Promise<void>;

    autoLayout: () => Promise<void>;
    alignSelectedNodes: (type: "left" | "center" | "right" | "top" | "middle" | "bottom") => Promise<void>;
    distributeSelectedNodes: (axis: "horizontal" | "vertical") => Promise<void>;
    reparentNodes: (nodeIds: string[], newParentId: string) => Promise<void>;

    applyRemoteNodeCreated: (node: NodeType) => void;
    applyRemoteNodeUpdated: (id: string, updates: Partial<NodeType>) => void;
    applyRemoteNodesUpdated: (updates: { id: string; x: number; y: number }[]) => void;
    applyRemoteNodeDeleted: (id: string) => void;
    applyRemoteNodesDeleted: (ids: string[]) => void;
}

export const createNodeSlice: SliceCreator<NodeSlice> = (set, get) => ({
    nodes: [],

    appendNodes: (newNodes) =>
        set((state) => ({
            nodes: [
                ...state.nodes,
                ...newNodes.map(n => ({
                    _id: String(n._id),
                    text: n.text,
                    notes: n.notes ?? "",
                    x: n.x, y: n.y,
                    parentId: n.parentId ? String(n.parentId) : null,
                    color: n.color ?? undefined,
                    fontSize: n.fontSize ?? undefined,
                    collapsed: false,
                })),
            ],
        })),

    replaceNodes: async (mindMapId) => {
        try {
            const res = await api.get(`/mindmaps/${mindMapId}/nodes`);
            set({ nodes: (res.data || []).map(normalizeNode), selectedNodeIds: new Set() });
        } catch (err) { console.error("[replaceNodes] Failed:", err); }
    },

    loadNodes: async (mindMapId) => {
        set({ isLoadingMap: true });
        try {
            const [nodesRes, mapRes] = await Promise.all([
                api.get(`/mindmaps/${mindMapId}/nodes`),
                api.get(`/mindmaps/${mindMapId}`),
            ]);
            set({ nodes: (nodesRes.data || []).map(normalizeNode), mapTitle: mapRes.data?.title ?? "", isLoadingMap: false });
        } catch (err) { console.error("Failed to load map/nodes:", err); set({ isLoadingMap: false }); }
    },

    createNode: async (mindMapId, parent) => {
        const res = await api.post("/mindmaps/nodes", { mindMapId, parentId: parent._id, x: parent.x + 200, y: parent.y });
        const newNode = normalizeNode(res.data);
        set({ nodes: [...get().nodes, newNode], selectedNodeIds: new Set([newNode._id]) });
        get().pushHistory();
        socketService.emitNodeAdded(newNode);
    },

    commitDragEnd: async (id, x, y) => {
        set({ nodes: get().nodes.map(n => n._id === id ? { ...n, x, y } : n) });
        try {
            await api.patch(`/mindmaps/nodes/${id}`, { x, y });
            get().pushHistory();
            socketService.emitNodeDragged(id, x, y);
        } catch (err) { console.error("Failed to save node position:", err); }
    },

    commitBatchDragEnd: async (updates) => {
        set({ nodes: get().nodes.map(n => { const u = updates.find(u => u.id === n._id); return u ? { ...n, x: u.x, y: u.y } : n; }) });
        try {
            await Promise.all(updates.map(u => api.patch(`/mindmaps/nodes/${u.id}`, { x: u.x, y: u.y })));
            get().pushHistory();
            socketService.emitNodesUpdated(updates);
        } catch (err) { console.error("Failed to save batch positions:", err); }
    },

    updateNodeColor: async (id, color) => {
        set({ nodes: get().nodes.map(n => n._id === id ? { ...n, color } : n) });
        get().pushHistory();
        try { await api.patch(`/mindmaps/nodes/${id}`, { color }); socketService.emitNodeUpdated(id, { color }); }
        catch (err) { console.error("Failed to save node color:", err); }
    },

    updateNodeFontSize: async (id, fontSize) => {
        set({ nodes: get().nodes.map(n => n._id === id ? { ...n, fontSize } : n) });
        get().pushHistory();
        try { await api.patch(`/mindmaps/nodes/${id}`, { fontSize }); socketService.emitNodeUpdated(id, { fontSize }); }
        catch (err) { console.error("Failed to save node font size:", err); }
    },

    updateNodeText: async (id, text) => {
        try {
            await api.patch(`/mindmaps/nodes/${id}/text`, { text });
            set({ nodes: get().nodes.map(n => n._id === id ? { ...n, text } : n), editingNodeId: null });
            get().pushHistory();
            socketService.emitNodeUpdated(id, { text });
            socketService.emitNodeEditingStopped(id);
        } catch (err) { console.error("Failed to update node text:", err); }
    },

    updateNodeNotes: async (id, notes) => {
        try {
            await api.patch(`/mindmaps/nodes/${id}`, { notes });
            set({ nodes: get().nodes.map(n => n._id === id ? { ...n, notes } : n), editingNodeId: null });
            get().pushHistory();
            socketService.emitNodeUpdated(id, { notes });
        } catch (err) { console.error("Failed to update node notes:", err); }
    },

    toggleNodeCollapse: (id) => {
        performAnimatedLayoutChange(
            () => {
                set((state) => {
                    const idx = state.nodes.findIndex(n => n._id === id);
                    if (idx === -1) return {};
                    const node = state.nodes[idx];
                    const newCollapsed = !node.collapsed;
                    const newNodes = [...state.nodes];
                    newNodes[idx] = { ...node, collapsed: newCollapsed };
                    let newSelectedIds = state.selectedNodeIds;
                    if (newCollapsed) {
                        const descendants = new Set<string>();
                        const find = (pid: string) => newNodes.filter(n => n.parentId === pid).forEach(c => { descendants.add(c._id); find(c._id); });
                        find(id);
                        if ([...descendants].some(d => newSelectedIds.has(d))) {
                            newSelectedIds = new Set(state.selectedNodeIds);
                            descendants.forEach(d => newSelectedIds.delete(d));
                        }
                    }
                    return { nodes: newNodes, selectedNodeIds: newSelectedIds };
                });
            },
            () => get().setLayoutAnimating(true),
            () => get().setLayoutAnimating(false),
        );
        socketService.emitNodeUpdated(id, { collapsed: !get().nodes.find(n => n._id === id)?.collapsed });
    },

    deleteNode: async (id) => {
        set((s) => { const d = new Set(s.deletingNodeIds); d.add(id); return { deletingNodeIds: d }; });
        await new Promise(r => setTimeout(r, 300));
        try {
            await api.delete(`/mindmaps/nodes/${id}`);
            set((s) => {
                const d = new Set(s.deletingNodeIds); d.delete(id);
                return { nodes: s.nodes.filter(n => n._id !== id && n.parentId !== id), selectedNodeIds: new Set(), deletingNodeIds: d };
            });
            get().pushHistory();
            socketService.emitNodeDeleted(id);
        } catch (err) {
            console.error("Failed to delete node:", err);
            set((s) => { const d = new Set(s.deletingNodeIds); d.delete(id); return { deletingNodeIds: d }; });
        }
    },

    deleteSelectedNodes: async () => {
        const { selectedNodeIds, nodes } = get();
        if (selectedNodeIds.size === 0) return;
        const ids = Array.from(selectedNodeIds);
        set((s) => { const d = new Set(s.deletingNodeIds); ids.forEach(id => d.add(id)); return { deletingNodeIds: d }; });
        await new Promise(r => setTimeout(r, 300));
        try {
            await Promise.all(ids.map(id => api.delete(`/mindmaps/nodes/${id}`)));
            const toRemove = new Set(ids);
            let changed = true;
            while (changed) { changed = false; nodes.forEach(n => { if (n.parentId && toRemove.has(n.parentId) && !toRemove.has(n._id)) { toRemove.add(n._id); changed = true; } }); }
            set((s) => { const d = new Set(s.deletingNodeIds); ids.forEach(id => d.delete(id)); return { nodes: s.nodes.filter(n => !toRemove.has(n._id)), selectedNodeIds: new Set(), deletingNodeIds: d }; });
            get().pushHistory();
            socketService.emitNodesDeleted(Array.from(toRemove));
        } catch (err) {
            console.error("Failed to delete nodes:", err);
            set((s) => { const d = new Set(s.deletingNodeIds); ids.forEach(id => d.delete(id)); return { deletingNodeIds: d }; });
        }
    },

    autoLayout: async () => {
        const { nodes } = get();
        if (nodes.length === 0) return;
        const normalized = nodes.map(normalizeNode);
        const nodeIds = new Set(normalized.map(n => n._id));
        const roots = normalized.filter(n => !n.parentId || !nodeIds.has(n.parentId));
        let allPositioned: NodeType[] = [];
        let yOffset = 0;
        for (const root of [...roots].sort((a, b) => a.y - b.y)) {
            const subtree = calculateTreeLayout(normalized, root, root.x, allPositioned.length === 0 ? root.y : yOffset);
            allPositioned = [...allPositioned, ...subtree];
            yOffset = Math.max(...subtree.map(n => n.y)) + 200;
        }
        normalized.forEach(n => { if (!allPositioned.find(p => p._id === n._id)) allPositioned.push(n); });
        await performAnimatedLayoutChange(
            () => set({ nodes: allPositioned }),
            () => get().setLayoutAnimating(true),
            () => get().setLayoutAnimating(false),
        );
        try {
            await Promise.all(allPositioned.map(n => api.patch(`/mindmaps/nodes/${n._id}`, { x: n.x, y: n.y })));
            get().pushHistory();
            socketService.emitNodesUpdated(allPositioned.map(n => ({ id: n._id, x: n.x, y: n.y })));
        } catch (err) { console.error("[AutoLayout] Failed:", err); }
    },

    alignSelectedNodes: async (type) => {
        const { selectedNodeIds, nodes } = get();
        if (selectedNodeIds.size < 2) return;
        const NODE_W = 160, NODE_H = 44;
        const sel = nodes.filter(n => selectedNodeIds.has(n._id));
        let target: number;
        switch (type) {
            case "left": target = Math.min(...sel.map(n => n.x)); break;
            case "center": target = sel.reduce((s, n) => s + n.x + NODE_W / 2, 0) / sel.length; break;
            case "right": target = Math.max(...sel.map(n => n.x + NODE_W)); break;
            case "top": target = Math.min(...sel.map(n => n.y)); break;
            case "middle": target = sel.reduce((s, n) => s + n.y + NODE_H / 2, 0) / sel.length; break;
            case "bottom": target = Math.max(...sel.map(n => n.y + NODE_H)); break;
            default: target = 0;
        }
        const updates = sel.map(n => {
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
            () => set({ nodes: nodes.map(n => { const u = updates.find(u => u.id === n._id); return u ? { ...n, ...u } : n; }) }),
            () => get().setLayoutAnimating(true),
            () => get().setLayoutAnimating(false),
        );
        get().commitBatchDragEnd(updates);
    },

    distributeSelectedNodes: async (axis) => {
        const { selectedNodeIds, nodes } = get();
        if (selectedNodeIds.size < 3) return;
        const NODE_W = 160, NODE_H = 44;
        const sel = nodes.filter(n => selectedNodeIds.has(n._id));
        const updates: { id: string; x: number; y: number }[] = [];
        if (axis === "horizontal") {
            const sorted = [...sel].sort((a, b) => a.x - b.x);
            const gap = ((sorted[sorted.length - 1].x + NODE_W) - sorted[0].x - sorted.length * NODE_W) / (sorted.length - 1);
            sorted.forEach((n, i) => updates.push({ id: n._id, x: sorted[0].x + i * (NODE_W + gap), y: n.y }));
        } else {
            const sorted = [...sel].sort((a, b) => a.y - b.y);
            const gap = ((sorted[sorted.length - 1].y + NODE_H) - sorted[0].y - sorted.length * NODE_H) / (sorted.length - 1);
            sorted.forEach((n, i) => updates.push({ id: n._id, x: n.x, y: sorted[0].y + i * (NODE_H + gap) }));
        }
        await performAnimatedLayoutChange(
            () => set({ nodes: nodes.map(n => { const u = updates.find(u => u.id === n._id); return u ? { ...n, ...u } : n; }) }),
            () => get().setLayoutAnimating(true),
            () => get().setLayoutAnimating(false),
        );
        get().commitBatchDragEnd(updates);
    },

    reparentNodes: async (nodeIds, newParentId) => {
        const { nodes } = get();
        await performAnimatedLayoutChange(
            () => set({ nodes: nodes.map(n => nodeIds.includes(n._id) ? { ...n, parentId: newParentId } : n) }),
            () => get().setLayoutAnimating(true),
            () => get().setLayoutAnimating(false),
        );
        try {
            await Promise.all(nodeIds.map(id => api.patch(`/mindmaps/nodes/${id}`, { parentId: newParentId })));
            get().pushHistory();
            nodeIds.forEach(id => socketService.emitNodeUpdated(id, { parentId: newParentId }));
        } catch (err) { console.error("Failed to reparent nodes:", err); }
    },

    applyRemoteNodeCreated: (node) => set((s) => ({ nodes: [...s.nodes, node] })),
    applyRemoteNodeUpdated: (id, updates) => set((s) => ({ nodes: s.nodes.map(n => n._id === id ? { ...n, ...updates } : n) })),
    applyRemoteNodesUpdated: (updates) => set((s) => ({ nodes: s.nodes.map(n => { const u = updates.find(u => u.id === n._id); return u ? { ...n, ...u } : n; }) })),
    applyRemoteNodeDeleted: (id) => set((s) => ({ nodes: s.nodes.filter(n => n._id !== id && n.parentId !== id) })),
    applyRemoteNodesDeleted: (ids) => { const s = new Set(ids); set((state) => ({ nodes: state.nodes.filter(n => !s.has(n._id)) })); },
});
