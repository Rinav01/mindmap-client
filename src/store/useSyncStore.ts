import { create } from "zustand";

export type NetworkStatus = 'online' | 'offline' | 'syncing' | 'idle';

interface SyncState {
    networkStatus: NetworkStatus;
    syncLock: boolean;
    lastSyncTimestamp: number | null;
    
    setNetworkStatus: (status: NetworkStatus) => void;
    setSyncLock: (isLocked: boolean) => void;
    setLastSyncTimestamp: (timestamp: number) => void;
}

export const useSyncStore = create<SyncState>((set) => ({
    networkStatus: navigator.onLine ? 'idle' : 'offline',
    syncLock: false,
    lastSyncTimestamp: null,

    setNetworkStatus: (status) => set({ networkStatus: status }),
    setSyncLock: (isLocked) => set({ syncLock: isLocked }),
    setLastSyncTimestamp: (timestamp) => set({ lastSyncTimestamp: timestamp }),
}));
