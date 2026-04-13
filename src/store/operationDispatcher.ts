import { v4 as uuidv4 } from 'uuid';
import { dbOptions } from './indexedDb';
import { useSyncStore } from './useSyncStore';
import { api } from '../services/api';
import type { Operation, OperationType } from '../types/sync.ts';
import type { User } from '../types/user.ts';
import { useAuthStore } from './authStore.ts';

// A unique ID for this browser tab/session to avoid echoing own WebSocket events
export const CLIENT_ID = uuidv4();

// ─── Serialization lock ────────────────────────────────────────────────────────
// Prevents concurrent reads/writes to the IndexedDB operation queue which would
// cause lost operations when autoLayout or batch operations fire many calls at once.
let _queueChain: Promise<void> = Promise.resolve();

/**
 * Wraps an async function so that it runs serially — each call waits for
 * the previous one to finish before touching the queue.
 */
const withQueueLock = <T>(fn: () => Promise<T>): Promise<T> => {
    let result: T;
    _queueChain = _queueChain
        .then(() => fn().then(r => { result = r; }))
        .catch(() => { /* swallow so the chain doesn't break */ });
    return _queueChain.then(() => result!);
};

// ─── Single operation dispatch ─────────────────────────────────────────────────

export const dispatchOperation = async (
    type: OperationType,
    mapId: string,
    nodeId: string,
    payload: any,
    user: User | null
) => {
    if (!user) return; // Cannot dispatch without user context

    await withQueueLock(async () => {
        // 1. Create the operation object
        const operation: Operation = {
            operationId: uuidv4(),
            clientId: CLIENT_ID,
            type,
            mapId,
            nodeId,
            payload,
            timestamp: Date.now(),
            userId: user._id,
        };

        // 2. Fetch current queue
        const queue = await dbOptions.getOperationQueue();

        // 3. Compress queue if possible
        // We only compress MOVE_NODE and EDIT_NODE if the last operation in the queue
        // was the exact same type for the exact same node.
        let compressed = false;

        if (queue.length > 0) {
            const lastOp = queue[queue.length - 1];

            if (
                (type === 'MOVE_NODE' || type === 'EDIT_NODE') &&
                lastOp.type === type &&
                lastOp.nodeId === nodeId
            ) {
                // Combine payloads
                lastOp.payload = { ...lastOp.payload, ...payload };
                lastOp.timestamp = operation.timestamp; // Update to latest time
                compressed = true;
            }
        }

        if (!compressed) {
            queue.push(operation);
        }

        // Save updated queue back to IDB
        await dbOptions.setOperationQueue(queue);
    });

    // 4. Attempt sync if online (outside the lock so we don't block the queue)
    if (navigator.onLine) {
        debouncedSync();
    }
};

// ─── Batch operation dispatch ──────────────────────────────────────────────────
// Used by autoLayout, alignSelectedNodes, etc. to push many operations in one
// atomic IndexedDB write, avoiding multiple sequential reads/writes.

export const dispatchBatchOperations = async (
    ops: { type: OperationType; mapId: string; nodeId: string; payload: any }[],
    user: User | null
) => {
    if (!user || ops.length === 0) return;

    await withQueueLock(async () => {
        const queue = await dbOptions.getOperationQueue();

        for (const op of ops) {
            const operation: Operation = {
                operationId: uuidv4(),
                clientId: CLIENT_ID,
                type: op.type,
                mapId: op.mapId,
                nodeId: op.nodeId,
                payload: op.payload,
                timestamp: Date.now(),
                userId: user._id,
            };

            // Compress MOVE_NODE / EDIT_NODE if the last op matches
            let compressed = false;
            if (queue.length > 0) {
                const lastOp = queue[queue.length - 1];
                if (
                    (op.type === 'MOVE_NODE' || op.type === 'EDIT_NODE') &&
                    lastOp.type === op.type &&
                    lastOp.nodeId === op.nodeId
                ) {
                    lastOp.payload = { ...lastOp.payload, ...op.payload };
                    lastOp.timestamp = operation.timestamp;
                    compressed = true;
                }
            }
            if (!compressed) {
                queue.push(operation);
            }
        }

        await dbOptions.setOperationQueue(queue);
    });

    if (navigator.onLine) {
        debouncedSync();
    }
};

// ─── Debounced sync trigger ────────────────────────────────────────────────────
// Prevents firing dozens of sync requests when batch operations complete.
let _syncTimer: ReturnType<typeof setTimeout> | null = null;

const debouncedSync = () => {
    if (_syncTimer) clearTimeout(_syncTimer);
    _syncTimer = setTimeout(() => {
        _syncTimer = null;
        syncOperationQueue();
    }, 1500);
};

/** Cancel pending debounce and sync immediately. Call before navigating away. */
export const flushSync = () => {
    if (_syncTimer) {
        clearTimeout(_syncTimer);
        _syncTimer = null;
    }
    syncOperationQueue();
};

// ─── Sync engine ───────────────────────────────────────────────────────────────

/**
 * Reads the local queue and sends it to the backend.
 * Uses syncLock to prevent concurrent sync operations.
 */
export const syncOperationQueue = async () => {
    const syncState = useSyncStore.getState();
    const { token } = useAuthStore.getState();

    // Do not attempt sync if there's no auth token (store may not be rehydrated yet)
    if (!token) return;

    // Prevent overlapping syncs or syncing while offline
    if (syncState.syncLock || syncState.networkStatus === 'offline') return;

    const queue = await dbOptions.getOperationQueue();
    if (queue.length === 0) return; // Nothing to sync

    syncState.setSyncLock(true);
    syncState.setNetworkStatus('syncing');

    try {
        // Send ALL pending operations.
        const activeMapId = queue[0].mapId;

        const response = await api.post<{ acknowledged: string[] }>(`/mindmaps/${activeMapId}/sync`, {
            operations: queue
        });

        const { acknowledged } = response.data;

        // Filter out acknowledged operations from the local queue
        const remainingQueue = queue.filter(op => !acknowledged.includes(op.operationId));
        await dbOptions.setOperationQueue(remainingQueue);

        // Update last sync time
        const now = Date.now();
        await dbOptions.setLastSyncTimestamp(now);
        syncState.setLastSyncTimestamp(now);

        // If queue is empty, we are fully idle/synced
        if (remainingQueue.length === 0) {
            syncState.setNetworkStatus('idle');
        } else {
            // Some failed — schedule a retry instead of spamming console
            console.warn(`Partial sync: ${remainingQueue.length} operations pending. Will retry in 5s.`);
            syncState.setNetworkStatus('idle');
            setTimeout(() => syncOperationQueue(), 5000);
        }

    } catch (error: any) {
        console.error("Sync failed:", error);
        const status = error?.response?.status;

        if (!error?.response) {
            // True network failure — no response at all
            syncState.setNetworkStatus('offline');
        } else if (status === 401 || status === 403) {
            // Auth/permission error — retrying is pointless, clear the queue to stop the loop
            console.error(`Sync rejected with ${status}. Clearing queue to prevent infinite retry.`);
            await dbOptions.clearOperationQueue();
            syncState.setNetworkStatus('idle');
        } else {
            // Other server errors (500 etc.) — stay idle, will retry on next user action
            syncState.setNetworkStatus('idle');
        }
    } finally {
        syncState.setSyncLock(false);
    }
};
