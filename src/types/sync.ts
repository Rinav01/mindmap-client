export type OperationType = 'CREATE_NODE' | 'MOVE_NODE' | 'EDIT_NODE' | 'DELETE_NODE';

export interface Operation {
    operationId: string;
    clientId: string;
    type: OperationType;
    mapId: string;
    nodeId: string;
    payload: any;
    timestamp: number;
    userId: string;
}

export type NetworkStatus = 'online' | 'offline' | 'syncing' | 'idle';
