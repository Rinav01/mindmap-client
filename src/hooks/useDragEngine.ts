import { useRef, useCallback } from "react";
import { useEditorStore } from "../store/editorStore";

interface DragState {
    nodeId: string;
    startMouseX: number;
    startMouseY: number;
    startNodeX: number;
    startNodeY: number;
    zoom: number;
    panOffsetX: number;
    panOffsetY: number;
    nodeGroupEl: SVGGElement;
    rafId: number | null;
    // Final committed position (set on mouseup)
    finalX: number;
    finalY: number;
}

export interface DragEngine {
    onNodeMouseDown: (
        nodeId: string,
        nodeX: number,
        nodeY: number,
        groupEl: SVGGElement,
        e: React.MouseEvent
    ) => void;
    onMouseMove: (e: React.MouseEvent<SVGSVGElement>) => void;
    onMouseUp: () => void;
    registerEdge: (nodeId: string, pathEl: SVGPathElement | null) => void;
    isDragging: () => boolean;
}

/**
 * High-performance drag engine.
 *
 * During drag:
 *   - Zero Zustand writes
 *   - Zero React re-renders
 *   - Direct DOM mutation via requestAnimationFrame
 *
 * On mouseup:
 *   - One Zustand write (commitDragEnd)
 *   - One API call (inside commitDragEnd)
 */
export function useDragEngine(): DragEngine {
    const dragRef = useRef<DragState | null>(null);

    // Map from nodeId → its SVG path element (for connected edges)
    // Key: child node id; value: the path element for that edge
    const edgePathRefs = useRef<Map<string, SVGPathElement>>(new Map());

    // We read zoom/panOffset from the store imperatively (not as subscriptions)
    const getStore = useEditorStore.getState;

    const registerEdge = useCallback(
        (nodeId: string, pathEl: SVGPathElement | null) => {
            if (pathEl) {
                edgePathRefs.current.set(nodeId, pathEl);
            } else {
                edgePathRefs.current.delete(nodeId);
            }
        },
        []
    );

    const onNodeMouseDown = useCallback(
        (
            nodeId: string,
            nodeX: number,
            nodeY: number,
            groupEl: SVGGElement,
            e: React.MouseEvent
        ) => {
            e.stopPropagation();
            const { zoom, panOffset } = getStore();

            dragRef.current = {
                nodeId,
                startMouseX: e.clientX,
                startMouseY: e.clientY,
                startNodeX: nodeX,
                startNodeY: nodeY,
                zoom,
                panOffsetX: panOffset.x,
                panOffsetY: panOffset.y,
                nodeGroupEl: groupEl,
                rafId: null,
                finalX: nodeX,
                finalY: nodeY,
            };
        },
        [getStore]
    );

    const onMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        const drag = dragRef.current;
        if (!drag) return;

        // Cancel any pending frame
        if (drag.rafId !== null) {
            cancelAnimationFrame(drag.rafId);
        }

        // Capture values for the closure (avoid stale ref in rAF)
        const clientX = e.clientX;
        const clientY = e.clientY;

        drag.rafId = requestAnimationFrame(() => {
            const d = dragRef.current;
            if (!d) return;

            const dx = (clientX - d.startMouseX) / d.zoom;
            const dy = (clientY - d.startMouseY) / d.zoom;
            const newX = d.startNodeX + dx;
            const newY = d.startNodeY + dy;

            // Store for commit on mouseup
            d.finalX = newX;
            d.finalY = newY;

            // ── Direct DOM mutation: move the node group ──
            d.nodeGroupEl.setAttribute("transform", `translate(${newX}, ${newY})`);

            // ── Direct DOM mutation: update connected edges ──
            const { nodes } = getStore();
            const node = nodes.find((n) => n._id === d.nodeId);
            if (!node) return;

            const NODE_W = 160;
            const NODE_H_HALF = 22;

            // Update edge FROM this node to its parent (this node is the child)
            const parentEdgePath = edgePathRefs.current.get(d.nodeId);
            if (parentEdgePath) {
                const parent = nodes.find((n) => n._id === node.parentId);
                if (parent) {
                    const startX = parent.x + NODE_W;
                    const startY = parent.y + NODE_H_HALF;
                    const endX = newX;
                    const endY = newY + NODE_H_HALF;
                    const controlX = (startX + endX) / 2;
                    parentEdgePath.setAttribute(
                        "d",
                        `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`
                    );
                }
            }

            // Update edges FROM this node's children TO this node (this node is the parent)
            const children = nodes.filter((n) => n.parentId === d.nodeId);
            for (const child of children) {
                const childEdgePath = edgePathRefs.current.get(child._id);
                if (childEdgePath) {
                    const startX = newX + NODE_W;
                    const startY = newY + NODE_H_HALF;
                    const endX = child.x;
                    const endY = child.y + NODE_H_HALF;
                    const controlX = (startX + endX) / 2;
                    childEdgePath.setAttribute(
                        "d",
                        `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`
                    );
                }
            }

            drag.rafId = null;
        });
    }, [getStore]);

    const onMouseUp = useCallback(() => {
        const drag = dragRef.current;
        if (!drag) return;

        // Cancel any pending frame
        if (drag.rafId !== null) {
            cancelAnimationFrame(drag.rafId);
            drag.rafId = null;
        }

        const { finalX, finalY, nodeId } = drag;
        dragRef.current = null;

        // One Zustand write + one API call
        useEditorStore.getState().commitDragEnd(nodeId, finalX, finalY);
    }, []);

    const isDragging = useCallback(() => dragRef.current !== null, []);

    return { onNodeMouseDown, onMouseMove, onMouseUp, registerEdge, isDragging };
}
