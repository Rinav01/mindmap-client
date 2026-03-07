import type { SliceCreator } from ".";
import { api } from "../../services/api";
import { performAnimatedLayoutChange } from "../../engine/motionEngine";
import { socketService } from "../../services/socket";
import { getCurrentUserInfo } from "../../utils/userInfo";
import type { NodeType } from "../../types/mindmap";

// ─── State ────────────────────────────────────────────────────────────────────

export interface CanvasSlice {
    // Viewport
    zoom: number;
    panOffset: { x: number; y: number };
    isPanning: boolean;
    isPanMode: boolean;
    isLayoutAnimating: boolean;

    // Selection
    selectedNodeIds: Set<string>;
    focusNodeId: string | null;

    // Undo/Redo
    history: NodeType[][];
    historyIndex: number;
    deletingNodeIds: Set<string>;

    // Title
    mapTitle: string;
    isLoadingMap: boolean;
    editingNodeId: string | null;

    // Actions — viewport
    setZoom: (zoom: number) => void;
    startPan: () => void;
    updatePan: (deltaX: number, deltaY: number) => void;
    endPan: () => void;
    togglePanMode: () => void;
    setIsPanMode: (active: boolean) => void;
    fitToScreen: () => void;
    setLayoutAnimating: (busy: boolean) => void;

    // Actions — selection
    selectNode: (id: string, multi?: boolean) => void;
    selectNodes: (ids: string[], multi?: boolean) => void;
    deselectAll: () => void;
    setFocusNodeId: (nodeId: string | null) => void;
    getFocusedSubtree: () => Set<string>;

    // Actions — history
    pushHistory: () => void;
    undo: () => Promise<void>;
    redo: () => Promise<void>;

    // Actions — editing
    startEditing: (id: string) => void;
    cancelEditing: () => void;
    broadcastEditing: (id: string) => void;
    broadcastEditingStopped: (id: string) => void;

    // Actions — title & load state
    setMapTitle: (mindMapId: string, title: string) => Promise<void>;
}

// ─── Slice ────────────────────────────────────────────────────────────────────

export const createCanvasSlice: SliceCreator<CanvasSlice> = (set, get) => ({
    zoom: 1,
    panOffset: { x: 0, y: 0 },
    isPanning: false,
    isPanMode: false,
    isLayoutAnimating: false,
    selectedNodeIds: new Set(),
    focusNodeId: null,
    history: [],
    historyIndex: -1,
    deletingNodeIds: new Set(),
    mapTitle: "",
    isLoadingMap: true,
    editingNodeId: null,

    setZoom: (zoom) => set({ zoom: Math.max(0.1, Math.min(3, zoom)) }),
    startPan: () => set({ isPanning: true }),
    updatePan: (deltaX, deltaY) => {
        const { panOffset } = get();
        set({ panOffset: { x: panOffset.x + deltaX, y: panOffset.y + deltaY } });
    },
    endPan: () => set({ isPanning: false }),
    togglePanMode: () => set((s) => ({ isPanMode: !s.isPanMode })),
    setIsPanMode: (isPanMode) => set({ isPanMode }),
    setLayoutAnimating: (isLayoutAnimating) => set({ isLayoutAnimating }),

    fitToScreen: () => {
        const { nodes } = get();
        if (nodes.length === 0) return;
        const NODE_W = 160, NODE_H = 44, PADDING = 80;
        const minX = Math.min(...nodes.map(n => n.x));
        const minY = Math.min(...nodes.map(n => n.y));
        const maxX = Math.max(...nodes.map(n => n.x + NODE_W));
        const maxY = Math.max(...nodes.map(n => n.y + NODE_H));
        const contentW = maxX - minX, contentH = maxY - minY;
        const vpW = window.innerWidth, vpH = window.innerHeight - 52;
        const newZoom = Math.min(Math.max(Math.min((vpW - PADDING * 2) / contentW, (vpH - PADDING * 2) / contentH), 0.1), 2);
        set({
            zoom: newZoom,
            panOffset: {
                x: vpW / 2 - (minX + contentW / 2) * newZoom,
                y: vpH / 2 - (minY + contentH / 2) * newZoom + 52,
            },
        });
    },

    selectNode: (id, multi = false) => {
        set((state) => {
            const newSet = new Set(multi ? state.selectedNodeIds : []);
            if (multi && newSet.has(id)) newSet.delete(id);
            else newSet.add(id);
            socketService.emitSelectionUpdate(Array.from(newSet), getCurrentUserInfo());
            return { selectedNodeIds: newSet };
        });
    },

    selectNodes: (ids, multi = false) => {
        set((state) => {
            const newSet = new Set(multi ? state.selectedNodeIds : []);
            ids.forEach(id => newSet.add(id));
            socketService.emitSelectionUpdate(Array.from(newSet), getCurrentUserInfo());
            return { selectedNodeIds: newSet };
        });
    },

    deselectAll: () => {
        set({ selectedNodeIds: new Set() });
        socketService.emitSelectionUpdate([], getCurrentUserInfo());
    },

    setFocusNodeId: (nodeId) => set({ focusNodeId: nodeId }),

    getFocusedSubtree: () => {
        const { focusNodeId, nodes } = get();
        if (!focusNodeId) return new Set();
        const descendantIds = new Set<string>();
        const queue = [focusNodeId];
        const childrenMap = new Map<string, string[]>();
        nodes.forEach(n => {
            if (n.parentId) {
                if (!childrenMap.has(n.parentId)) childrenMap.set(n.parentId, []);
                childrenMap.get(n.parentId)!.push(n._id);
            }
        });
        while (queue.length > 0) {
            const currentId = queue.shift()!;
            descendantIds.add(currentId);
            const children = childrenMap.get(currentId);
            if (children) queue.push(...children);
        }
        return descendantIds;
    },

    pushHistory: () => {
        const { nodes } = get();
        set((state) => {
            const newHistory = state.history.slice(0, state.historyIndex + 1);
            newHistory.push(JSON.parse(JSON.stringify(nodes)));
            if (newHistory.length > 50) newHistory.shift();
            return { history: newHistory, historyIndex: newHistory.length - 1 };
        });
    },

    undo: async () => {
        await performAnimatedLayoutChange(
            async () => {
                const { history, historyIndex } = get();
                if (historyIndex > 0) {
                    set({ nodes: history[historyIndex - 1], historyIndex: historyIndex - 1, selectedNodeIds: new Set() });
                }
            },
            () => get().setLayoutAnimating(true),
            () => get().setLayoutAnimating(false),
        );
    },

    redo: async () => {
        const { history, historyIndex } = get();
        if (historyIndex >= history.length - 1) return;
        const newIndex = historyIndex + 1;
        const snapshot = history[newIndex];
        await performAnimatedLayoutChange(
            () => { set({ nodes: JSON.parse(JSON.stringify(snapshot)), historyIndex: newIndex }); },
            () => get().setLayoutAnimating(true),
            () => get().setLayoutAnimating(false),
        );
        try {
            await Promise.all(snapshot.map(node =>
                api.patch(`/mindmaps/nodes/${node._id}`, { x: node.x, y: node.y, text: node.text })
            ));
            socketService.emitNodesUpdated(snapshot.map(node => ({ id: node._id, x: node.x, y: node.y })));
        } catch (err) { console.error("Failed to redo sync:", err); }
    },

    startEditing: (id) => {
        set({ editingNodeId: id });
        socketService.emitNodeEditing(id, getCurrentUserInfo());
    },

    cancelEditing: () => {
        const editingId = get().editingNodeId;
        set({ editingNodeId: null });
        if (editingId) socketService.emitNodeEditingStopped(editingId);
    },

    broadcastEditing: (id) => {
        socketService.emitNodeEditing(id, getCurrentUserInfo());
    },

    broadcastEditingStopped: (id) => socketService.emitNodeEditingStopped(id),

    setMapTitle: async (mindMapId, title) => {
        set({ mapTitle: title });
        try { await api.patch(`/mindmaps/${mindMapId}/title`, { title }); }
        catch (err) { console.error("Failed to save map title:", err); }
    },
});
