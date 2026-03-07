import type { SliceCreator } from ".";
import type { LiveCursor } from "../../types/mindmap";

export interface CollabSlice {
    liveCursors: Record<string, LiveCursor>;
    onlineUsers: Record<string, { name: string; color: string }>;
    remoteEditingNodes: Record<string, { name: string; color: string }>;
    remoteSelections: Record<string, { nodeIds: string[]; user: { name: string; color: string } }>;

    updateLiveCursor: (id: string, data: LiveCursor) => void;
    removeLiveCursor: (id: string) => void;
    setOnlineUsers: (users: Record<string, { name: string; color: string }>) => void;
    addOnlineUser: (id: string, data: { name: string; color: string }) => void;
    removeOnlineUser: (id: string) => void;
    setRemoteNodeEditing: (nodeId: string, user: { name: string; color: string }) => void;
    clearRemoteNodeEditing: (nodeId: string) => void;
    setRemoteSelection: (userId: string, nodeIds: string[], user: { name: string; color: string }) => void;
    clearRemoteSelection: (userId: string) => void;
}

export const createCollabSlice: SliceCreator<CollabSlice> = (set) => ({
    liveCursors: {},
    onlineUsers: {},
    remoteEditingNodes: {},
    remoteSelections: {},

    updateLiveCursor: (id, data) => set((s) => ({ liveCursors: { ...s.liveCursors, [id]: data } })),
    removeLiveCursor: (id) => set((s) => { const c = { ...s.liveCursors }; delete c[id]; return { liveCursors: c }; }),

    setOnlineUsers: (users) => set({ onlineUsers: users }),
    addOnlineUser: (id, data) => set((s) => ({ onlineUsers: { ...s.onlineUsers, [id]: data } })),
    removeOnlineUser: (id) => set((s) => { const u = { ...s.onlineUsers }; delete u[id]; return { onlineUsers: u }; }),

    setRemoteNodeEditing: (nodeId, user) => set((s) => ({ remoteEditingNodes: { ...s.remoteEditingNodes, [nodeId]: user } })),
    clearRemoteNodeEditing: (nodeId) => set((s) => { const e = { ...s.remoteEditingNodes }; delete e[nodeId]; return { remoteEditingNodes: e }; }),

    setRemoteSelection: (userId, nodeIds, user) => set((s) => ({ remoteSelections: { ...s.remoteSelections, [userId]: { nodeIds, user } } })),
    clearRemoteSelection: (userId) => set((s) => { const r = { ...s.remoteSelections }; delete r[userId]; return { remoteSelections: r }; }),
});
