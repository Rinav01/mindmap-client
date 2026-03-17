// ─── Core node ────────────────────────────────────────────────────────────────

export interface NodeType {
    _id: string;
    text: string;
    notes?: string;
    x: number;
    y: number;
    parentId: string | null;
    color?: string;
    fontSize?: number;
    collapsed?: boolean;
}

// ─── Collaboration ─────────────────────────────────────────────────────────────

export interface LiveCursor {
    x: number;
    y: number;
    name: string;
    color: string;
}

// ─── Versions ─────────────────────────────────────────────────────────────────

export interface MindMapVersion {
    _id: string;
    label: string;
    actionType: "manual" | "auto-layout" | "align" | "delete" | "restore";
    createdAt: string;
    createdBy?: {
        _id: string;
        username: string;
        color: string;
    };
}

// ─── Activity ─────────────────────────────────────────────────────────────────

export interface ActivityLogType {
    _id: string;
    mindMapId: string;
    userId: {
        _id: string;
        username: string;
        color: string;
    };
    action: "NODE_CREATED" | "NODE_DELETED" | "NODE_EDITED" | "NODE_MOVED" | "NODE_COLOR_CHANGED" | "AI_GENERATED" | "AI_EXPANDED";
    nodeId?: string;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    metadata?: any;
    createdAt: string;
}

// ─── Comments ─────────────────────────────────────────────────────────────────

export interface NodeCommentType {
    _id: string;
    nodeId: string;
    mapId: string;
    content: string;
    createdAt: string;
    userId: {
        _id: string;
        name: string;
        username?: string;
        color: string;
    };
}

// ─── Members ──────────────────────────────────────────────────────────────────

export interface MapMemberType {
    _id: string;
    mindMapId: string;
    userId: {
        _id: string;
        username: string;
        email: string;
        color: string;
    };
    role: "OWNER" | "EDITOR" | "VIEWER";
    invitedBy?: {
        _id: string;
        username: string;
    };
    createdAt: string;
}
