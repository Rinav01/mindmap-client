import type { SliceCreator } from ".";
import { api } from "../../services/api";
import { performAnimatedLayoutChange } from "../../engine/motionEngine";
import { socketService } from "../../services/socket";
import type { MindMapVersion, NodeType } from "../../types/mindmap";
import { normalizeNode } from "./nodeSlice";

export interface VersionSlice {
    versions: MindMapVersion[];
    currentVersionId: string | null;

    loadVersions: (mindMapId: string) => Promise<void>;
    createSnapshot: (mindMapId: string, name: string) => Promise<void>;
    restoreVersion: (mindMapId: string, versionId: string) => Promise<void>;
    deleteVersion: (mindMapId: string, versionId: string) => Promise<void>;
    applyRemoteMapRestored: (nodes: NodeType[], versionId: string) => Promise<void>;
}

export const createVersionSlice: SliceCreator<VersionSlice> = (set, get) => ({
    versions: [],
    currentVersionId: null,

    loadVersions: async (mindMapId) => {
        try {
            const res = await api.get(`/mindmaps/${mindMapId}/versions`);
            set({ versions: res.data });
        } catch (err) { console.error("Failed to load versions:", err); }
    },

    createSnapshot: async (mindMapId, name) => {
        try {
            await api.post(`/mindmaps/${mindMapId}/versions`, { label: name, actionType: "manual" });
            get().loadVersions(mindMapId);
            socketService.emitMapVersionsChanged();
        } catch (err) { console.error("Failed to create snapshot:", err); }
    },

    deleteVersion: async (mindMapId, versionId) => {
        try {
            await api.delete(`/mindmaps/${mindMapId}/versions/${versionId}`);
            set((s) => ({
                versions: s.versions.filter(v => v._id !== versionId),
                currentVersionId: s.currentVersionId === versionId ? null : s.currentVersionId,
            }));
            socketService.emitMapVersionsChanged();
        } catch (err) { console.error("Failed to delete version:", err); }
    },

    restoreVersion: async (mindMapId, versionId) => {
        try {
            const res = await api.post(`/mindmaps/${mindMapId}/versions/${versionId}/restore`);
            let restoredNodes: unknown[] | null = null;
            if (Array.isArray(res.data)) restoredNodes = res.data;
            else if (res.data && Array.isArray(res.data.nodes)) restoredNodes = res.data.nodes;

            if (restoredNodes) {
                const normalized: NodeType[] = restoredNodes.map(normalizeNode);
                await performAnimatedLayoutChange(
                    () => set({ nodes: normalized, selectedNodeIds: new Set(), currentVersionId: versionId }),
                    () => get().setLayoutAnimating(true),
                    () => get().setLayoutAnimating(false),
                );
                get().pushHistory();
                socketService.emitMapRestored(normalized, versionId);
            } else {
                console.warn("[Version] No nodes in restore response — reloading.");
                await get().loadNodes(mindMapId);
            }
        } catch (err) { console.error("[Version] Failed to restore:", err); }
    },

    applyRemoteMapRestored: async (nodes, versionId) => {
        await performAnimatedLayoutChange(
            () => set({ nodes, selectedNodeIds: new Set(), currentVersionId: versionId }),
            () => get().setLayoutAnimating(true),
            () => get().setLayoutAnimating(false),
        );
        get().pushHistory();
    },
});
