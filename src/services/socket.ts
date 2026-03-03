import { io, Socket } from "socket.io-client";
import type { NodeType } from "../store/editorStore";

// Get base URL for socket, defaulting to localhost for dev if not provided
const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

class SocketService {
    private socket: Socket | null = null;
    private mindMapId: string | null = null;
    private disconnectTimer: ReturnType<typeof setTimeout> | null = null;
    private pendingListeners: Array<{ event: string, callback: (...args: any[]) => void }> = [];

    private userInfo: { name: string; color: string } | null = null;

    connect(mindMapId: string, user?: { name: string; color: string }) {
        // Cancel any pending disconnection if we immediately reconnect
        if (this.disconnectTimer) {
            clearTimeout(this.disconnectTimer);
            this.disconnectTimer = null;
        }

        if (user) this.userInfo = user;

        if (this.socket && this.mindMapId === mindMapId) {
            // Already connected, but user info may have changed — re-emit join-map
            if (user && this.socket.connected) {
                this.socket.emit("join-map", { mapId: mindMapId, user: this.userInfo });
            }
            return;
        }

        // Force a synchronous disconnect of whatever else is going on
        this.executeDisconnect();

        this.mindMapId = mindMapId;
        this.socket = io(SOCKET_URL, {
            transports: ["websocket"],
        });

        // Attach pending listeners
        this.pendingListeners.forEach(({ event, callback }) => {
            this.socket?.on(event, callback);
        });
        this.pendingListeners = [];

        this.socket.on("connect", () => {
            console.log("[Socket] Connected:", this.socket?.id);
            this.socket?.emit("join-map", {
                mapId: mindMapId,
                user: this.userInfo || { name: "Anonymous", color: "#3b82f6" }
            });
        });

        this.socket.on("disconnect", () => {
            console.log("[Socket] Disconnected");
        });

        this.socket.on("error", (err) => {
            console.error("[Socket] Error:", err);
        });
    }

    disconnect() {
        if (this.disconnectTimer) return;

        // Delay destruction by 1000ms to survive React StrictMode double-renders and Vite HMR
        this.disconnectTimer = setTimeout(() => {
            this.executeDisconnect();
            this.disconnectTimer = null;
        }, 1000);
    }

    private executeDisconnect() {
        if (this.socket) {
            if (this.mindMapId) {
                this.socket.emit("leave-map", this.mindMapId);
            }
            this.socket.disconnect();
            this.socket = null;
            this.mindMapId = null;
            this.pendingListeners = [];
        }
    }

    // --- Emitters ---

    emitNodeAdded(node: NodeType) {
        if (!this.socket?.connected || !this.mindMapId) return;
        this.socket.emit("node-added", { mapId: this.mindMapId, node });
    }

    emitNodeDragged(id: string, x: number, y: number) {
        if (!this.socket?.connected || !this.mindMapId) return;
        this.socket.emit("node-dragged", { mapId: this.mindMapId, nodeId: id, position: { x, y } });
    }

    emitNodeUpdated(id: string, updates: Partial<NodeType>) {
        if (!this.socket?.connected || !this.mindMapId) return;
        this.socket.emit("node-updated", { mapId: this.mindMapId, node: { ...updates, _id: id } });
    }

    emitNodesUpdated(updates: { id: string; x: number; y: number }[]) {
        if (!this.socket?.connected || !this.mindMapId) return;
        // Backend doesn't have a batch route, so we loop singular
        updates.forEach(u => this.emitNodeDragged(u.id, u.x, u.y));
    }

    emitNodeDeleted(id: string) {
        if (!this.socket?.connected || !this.mindMapId) return;
        this.socket.emit("node-deleted", { mapId: this.mindMapId, nodeId: id });
    }

    emitNodesDeleted(ids: string[]) {
        if (!this.socket?.connected || !this.mindMapId) return;
        // Backend doesn't have a batch route, so we loop singular
        ids.forEach(id => this.emitNodeDeleted(id));
    }

    emitCursorMoved(x: number, y: number, name: string, color: string) {
        if (!this.socket?.connected || !this.mindMapId) return;
        this.socket.emit("cursor-moved", { mapId: this.mindMapId, cursor: { x, y, name, color } });
    }

    emitNodeEditing(nodeId: string, user: { name: string; color: string }) {
        if (!this.socket?.connected || !this.mindMapId) return;
        this.socket.emit("node-editing", { mapId: this.mindMapId, nodeId, user });
    }

    emitNodeEditingStopped(nodeId: string) {
        if (!this.socket?.connected || !this.mindMapId) return;
        this.socket.emit("node-editing-stopped", { mapId: this.mindMapId, nodeId });
    }

    emitMapVersionsChanged() {
        if (!this.socket?.connected || !this.mindMapId) return;
        this.socket.emit("map-versions-changed", this.mindMapId);
    }

    emitMapRestored(nodes: NodeType[], versionId: string) {
        if (!this.socket?.connected || !this.mindMapId) return;
        this.socket.emit("map-restored", { mapId: this.mindMapId, nodes, versionId });
    }

    // --- Listeners Registration ---

    // We pass a callbacks object so the store can handle the raw data easily.
    // The store should use this method to bind its specific actions.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    on(event: string, callback: (...args: any[]) => void) {
        if (!this.socket) {
            this.pendingListeners.push({ event, callback });
            return;
        }
        this.socket.on(event, callback);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    off(event: string, callback?: (...args: any[]) => void) {
        this.pendingListeners = this.pendingListeners.filter(p => p.event !== event || (callback && p.callback !== callback));

        if (!this.socket) return;
        if (callback) {
            this.socket.off(event, callback);
        } else {
            this.socket.off(event);
        }
    }
}

export const socketService = new SocketService();
