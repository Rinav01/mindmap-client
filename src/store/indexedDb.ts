import { get, set, update, del } from 'idb-keyval';
import type { Operation } from '../types/sync.ts';
import type { NodeType } from './editorStore';

const OP_QUEUE_KEY = 'mindflow_operation_queue';
const LOCAL_MAP_PREFIX = 'mindflow_local_map_';
const LAST_SYNC_KEY = 'mindflow_last_sync_timestamp';

export const dbOptions = {
    // 1. Operation Queue Management
    getOperationQueue: async (): Promise<Operation[]> => {
        return (await get(OP_QUEUE_KEY)) || [];
    },

    pushToOperationQueue: async (operation: Operation): Promise<void> => {
        await update(OP_QUEUE_KEY, (val) => {
            const queue = (val as Operation[]) || [];
            queue.push(operation);
            return queue;
        });
    },

    setOperationQueue: async (queue: Operation[]): Promise<void> => {
        await set(OP_QUEUE_KEY, queue);
    },

    clearOperationQueue: async (): Promise<void> => {
        await del(OP_QUEUE_KEY);
    },

    // 2. Local Map State Backup (instant load)
    saveLocalMapState: async (mapId: string, nodes: NodeType[]): Promise<void> => {
        await set(`${LOCAL_MAP_PREFIX}${mapId}`, nodes);
    },

    getLocalMapState: async (mapId: string): Promise<NodeType[] | null> => {
        return (await get(`${LOCAL_MAP_PREFIX}${mapId}`)) || null;
    },

    // 3. Last Sync Timestamp
    setLastSyncTimestamp: async (timestamp: number): Promise<void> => {
        await set(LAST_SYNC_KEY, timestamp);
    },

    getLastSyncTimestamp: async (): Promise<number | null> => {
        return (await get(LAST_SYNC_KEY)) || null;
    }
};
