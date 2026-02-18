import { createContext, useContext } from "react";
import type { DragEngine } from "../hooks/useDragEngine";

// Provide a no-op default so components don't crash if used outside provider
const noop = () => { };

const DragContext = createContext<DragEngine>({
    onNodeMouseDown: noop,
    onMouseMove: noop,
    onMouseUp: noop,
    registerEdge: noop,
    isDragging: () => false,
});

export const DragProvider = DragContext.Provider;

export function useDragContext(): DragEngine {
    return useContext(DragContext);
}
