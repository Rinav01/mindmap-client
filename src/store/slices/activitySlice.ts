import type { SliceCreator } from ".";
import { api } from "../../services/api";
import { useAuthStore } from "../authStore";
import type { ActivityLogType, MapMemberType } from "../../types/mindmap";

export interface ActivitySlice {
    activityLogs: ActivityLogType[];
    mapMembers: MapMemberType[];
    currentUserRole: "OWNER" | "EDITOR" | "VIEWER" | null;

    loadActivityLogs: (mindMapId: string) => Promise<void>;
    appendActivityLog: (log: ActivityLogType) => void;
    loadMapMembers: (mindMapId: string) => Promise<void>;
}

export const createActivitySlice: SliceCreator<ActivitySlice> = (set) => ({
    activityLogs: [],
    mapMembers: [],
    currentUserRole: null,

    loadActivityLogs: async (mindMapId) => {
        try {
            const res = await api.get(`/mindmaps/${mindMapId}/activity`);
            set({ activityLogs: res.data || [] });
        } catch (err) { console.error("Failed to load activity logs:", err); }
    },

    appendActivityLog: (log) => set((s) => ({ activityLogs: [log, ...s.activityLogs] })),

    loadMapMembers: async (mindMapId) => {
        try {
            const res = await api.get(`/mindmaps/${mindMapId}/members`);
            const members: MapMemberType[] = res.data || [];
            const user = useAuthStore.getState().user;
            const myMembership = user ? members.find(m => m.userId._id === user._id) : null;
            set({ mapMembers: members, currentUserRole: myMembership?.role ?? null });
        } catch (err) { console.error("Failed to load map members:", err); }
    },
});
