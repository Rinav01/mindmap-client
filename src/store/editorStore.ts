/**
 * editorStore.ts — Thin orchestrator.
 *
 * State and actions are split into focused slices:
 *   canvasSlice   — viewport, selection, history, editing
 *   nodeSlice     — node CRUD, drag, layout, remote node handlers
 *   collabSlice   — live cursors, online users, remote edits/selections
 *   versionSlice  — snapshots and restore
 *   commentSlice  — node comments
 *   activitySlice — activity log and map members
 *
 * All consumers continue to import from this file unchanged.
 */

import { create } from "zustand";

import { createCanvasSlice, type CanvasSlice } from "./slices/canvasSlice";
import { createNodeSlice, type NodeSlice } from "./slices/nodeSlice";
import { createCollabSlice, type CollabSlice } from "./slices/collabSlice";
import { createVersionSlice, type VersionSlice } from "./slices/versionSlice";
import { createCommentSlice, type CommentSlice } from "./slices/commentSlice";
import { createActivitySlice, type ActivitySlice } from "./slices/activitySlice";

// ─── Re-export types so existing imports keep working ─────────────────────────
export type { NodeType, LiveCursor, MindMapVersion, ActivityLogType, NodeCommentType, MapMemberType } from "../types/mindmap";

// ─── Full store type ──────────────────────────────────────────────────────────
export type EditorState =
    CanvasSlice &
    NodeSlice &
    CollabSlice &
    VersionSlice &
    CommentSlice &
    ActivitySlice;

// ─── Store ────────────────────────────────────────────────────────────────────
export const useEditorStore = create<EditorState>()((...args) => ({
    ...createCanvasSlice(...args),
    ...createNodeSlice(...args),
    ...createCollabSlice(...args),
    ...createVersionSlice(...args),
    ...createCommentSlice(...args),
    ...createActivitySlice(...args),
}));
