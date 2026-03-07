import type { SliceCreator } from ".";
import { api } from "../../services/api";
import type { NodeCommentType } from "../../types/mindmap";

export interface CommentSlice {
    comments: Record<string, NodeCommentType[]>;

    loadComments: (mindMapId: string, nodeId: string) => Promise<void>;
    addComment: (mindMapId: string, nodeId: string, content: string) => Promise<void>;
    deleteComment: (mindMapId: string, nodeId: string, commentId: string) => Promise<void>;
    applyRemoteCommentAdded: (nodeId: string, comment: NodeCommentType) => void;
    applyRemoteCommentDeleted: (nodeId: string, commentId: string) => void;
}

export const createCommentSlice: SliceCreator<CommentSlice> = (set, get) => ({
    comments: {},

    loadComments: async (mindMapId, nodeId) => {
        try {
            const res = await api.get(`/mindmaps/${mindMapId}/nodes/${nodeId}/comments`);
            set((s) => ({ comments: { ...s.comments, [nodeId]: res.data || [] } }));
        } catch (err) { console.error("Failed to load comments:", err); }
    },

    addComment: async (mindMapId, nodeId, content) => {
        try {
            const res = await api.post(`/mindmaps/${mindMapId}/nodes/${nodeId}/comments`, { content });
            get().applyRemoteCommentAdded(nodeId, res.data);
        } catch (err) { console.error("Failed to post comment:", err); }
    },

    deleteComment: async (mindMapId, nodeId, commentId) => {
        try {
            await api.delete(`/mindmaps/${mindMapId}/nodes/${nodeId}/comments/${commentId}`);
            get().applyRemoteCommentDeleted(nodeId, commentId);
        } catch (err) { console.error("Failed to delete comment:", err); }
    },

    applyRemoteCommentAdded: (nodeId, comment) => {
        set((s) => {
            const existing = s.comments[nodeId] || [];
            if (existing.some(c => c._id === comment._id)) return s; // dedup
            return { comments: { ...s.comments, [nodeId]: [...existing, comment] } };
        });
    },

    applyRemoteCommentDeleted: (nodeId, commentId) => {
        set((s) => ({
            comments: { ...s.comments, [nodeId]: (s.comments[nodeId] || []).filter(c => c._id !== commentId) },
        }));
    },
});
