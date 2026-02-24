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
    targetParentId: string | null; // For reparenting
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
            const { zoom, panOffset, selectedNodeIds, nodes } = getStore();

            // Toggle dragging class to disable transitions during active movement
            groupEl.classList.add("dragging");

            const draggingIds = selectedNodeIds.has(nodeId) ? Array.from(selectedNodeIds) : [nodeId];

            draggingIds.forEach(id => {
                // Node transition
                document.getElementById(`node-group-${id}`)?.classList.add("dragging");

                // Edge transitions (incoming and outgoing)
                // Incoming edge (to this node from its parent)
                document.querySelector(`path.edge-path[id="edge-${id}"]`)?.classList.add("dragging");

                // Outgoing edges (from this node to its children)
                nodes.forEach(n => {
                    if (n.parentId === id) {
                        document.querySelector(`path.edge-path[id="edge-${n._id}"]`)?.classList.add("dragging");
                    }
                });
            });

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
                targetParentId: null,
            };
        },
        [getStore]
    );

    const onMouseMove = useCallback((e: React.MouseEvent<SVGSVGElement>) => {
        const drag = dragRef.current;
        if (!drag) return;

        if (drag.rafId !== null) {
            cancelAnimationFrame(drag.rafId);
        }

        const mouseX = e.clientX;
        const mouseY = e.clientY;

        drag.rafId = requestAnimationFrame(() => {
            const d = dragRef.current;
            if (!d) return;

            const { nodes, selectedNodeIds } = getStore();

            const NODE_W = 160;
            const NODE_H = 44;

            const NODE_SNAP_THRESHOLD = 8;
            const GRID_SNAP_THRESHOLD = 4;
            const GRID_SIZE = 20;

            // ─────────────────────────────────────
            // STEP 1: RAW POSITION
            // ─────────────────────────────────────
            const dx = (mouseX - d.startMouseX) / d.zoom;
            const dy = (mouseY - d.startMouseY) / d.zoom;

            const rawX = d.startNodeX + dx;
            const rawY = d.startNodeY + dy;

            // Selection bounding box
            let sMinX = rawX;
            let sMinY = rawY;
            let sMaxX = rawX + NODE_W;
            let sMaxY = rawY + NODE_H;

            if (selectedNodeIds.has(d.nodeId)) {
                selectedNodeIds.forEach(id => {
                    const node = nodes.find(n => n._id === id);
                    if (node && id !== d.nodeId) {
                        const nx = node.x + dx;
                        const ny = node.y + dy;
                        sMinX = Math.min(sMinX, nx);
                        sMinY = Math.min(sMinY, ny);
                        sMaxX = Math.max(sMaxX, nx + NODE_W);
                        sMaxY = Math.max(sMaxY, ny + NODE_H);
                    }
                });
            }

            const sCenterX = (sMinX + sMaxX) / 2;
            const sCenterY = (sMinY + sMaxY) / 2;

            // ─────────────────────────────────────
            // STEP 2: CLOSEST NODE SNAP
            // ─────────────────────────────────────
            let bestSnapX: number | null = null;
            let bestSnapY: number | null = null;
            let bestGuideX: number | null = null;
            let bestGuideY: number | null = null;

            let bestXDist = Infinity;
            let bestYDist = Infinity;

            const snapTargets = nodes.filter(
                n => n._id !== d.nodeId && !selectedNodeIds.has(n._id)
            );

            // ── STEP 2.5: Hierarchy Snappping (Priority) ──
            let hierarchicalX = false;
            let hierarchicalY = false;

            const draggingNode = nodes.find(n => n._id === d.nodeId);
            if (draggingNode) {
                // Parent alignment (Horizontal flow: same y)
                if (draggingNode.parentId) {
                    const parent = nodes.find(n => n._id === draggingNode.parentId);
                    if (parent) {
                        const py = parent.y;
                        if (Math.abs(rawY - py) < NODE_SNAP_THRESHOLD) {
                            bestSnapY = py;
                            bestGuideY = py;
                            bestYDist = Math.abs(rawY - py);
                            hierarchicalY = true;
                        }
                    }
                }

                // Sibling alignment
                if (draggingNode.parentId) {
                    const siblings = nodes.filter(n => n.parentId === draggingNode.parentId && n._id !== draggingNode._id && !selectedNodeIds.has(n._id));
                    for (const sib of siblings) {
                        // Vertical same-column alignment
                        if (Math.abs(rawX - sib.x) < NODE_SNAP_THRESHOLD) {
                            bestSnapX = sib.x;
                            bestGuideX = sib.x;
                            bestXDist = Math.abs(rawX - sib.x);
                            hierarchicalX = true;
                        }
                    }
                }
            }

            for (const target of snapTargets) {
                // Don't override hierarchical snap if it's already very close
                if (hierarchicalX && bestXDist < 2) continue;

                const tx = target.x;
                const ty = target.y;
                const tMaxX = tx + NODE_W;
                const tMaxY = ty + NODE_H;
                const tCenterX = tx + NODE_W / 2;
                const tCenterY = ty + NODE_H / 2;

                const xCandidates = [
                    [sMinX, tx],
                    [sMaxX, tMaxX],
                    [sCenterX, tCenterX],
                    [sMinX, tMaxX],
                    [sMaxX, tx]
                ];

                for (const [dragVal, targetVal] of xCandidates) {
                    const dist = Math.abs(dragVal - targetVal);
                    if (dist < NODE_SNAP_THRESHOLD && dist < bestXDist) {
                        bestXDist = dist;
                        bestSnapX = rawX + (targetVal - dragVal);
                        bestGuideX = targetVal;
                    }
                }

                const yCandidates = [
                    [sMinY, ty],
                    [sMaxY, tMaxY],
                    [sCenterY, tCenterY],
                    [sMinY, tMaxY],
                    [sMaxY, ty]
                ];

                for (const [dragVal, targetVal] of yCandidates) {
                    const dist = Math.abs(dragVal - targetVal);
                    if (dist < NODE_SNAP_THRESHOLD && dist < bestYDist) {
                        bestYDist = dist;
                        bestSnapY = rawY + (targetVal - dragVal);
                        bestGuideY = targetVal;
                    }
                }
            }

            // ─────────────────────────────────────
            // STEP 3: GRID FALLBACK
            // ─────────────────────────────────────
            let finalX = rawX;
            let finalY = rawY;

            if (bestSnapX !== null) {
                finalX = bestSnapX;
            } else {
                const gridX = Math.round(rawX / GRID_SIZE) * GRID_SIZE;
                if (Math.abs(rawX - gridX) < GRID_SNAP_THRESHOLD) {
                    finalX = gridX;
                }
            }

            if (bestSnapY !== null) {
                finalY = bestSnapY;
            } else {
                const gridY = Math.round(rawY / GRID_SIZE) * GRID_SIZE;
                if (Math.abs(rawY - gridY) < GRID_SNAP_THRESHOLD) {
                    finalY = gridY;
                }
            }

            const snappedDx = finalX - d.startNodeX;
            const snappedDy = finalY - d.startNodeY;

            d.finalX = finalX;
            d.finalY = finalY;

            // ─────────────────────────────────────
            // STEP 4: APPLY TRANSFORM
            // ─────────────────────────────────────
            const currentPositions = new Map<string, { x: number; y: number }>();
            currentPositions.set(d.nodeId, { x: finalX, y: finalY });

            d.nodeGroupEl.setAttribute(
                "transform",
                `translate(${finalX}, ${finalY})`
            );

            if (selectedNodeIds.size > 1 && selectedNodeIds.has(d.nodeId)) {
                selectedNodeIds.forEach(id => {
                    if (id === d.nodeId) return;
                    const group = document.getElementById(`node-group-${id}`);
                    const node = nodes.find(n => n._id === id);
                    if (group && node) {
                        const nx = node.x + snappedDx;
                        const ny = node.y + snappedDy;
                        group.setAttribute(
                            "transform",
                            `translate(${nx}, ${ny})`
                        );
                        currentPositions.set(id, { x: nx, y: ny });
                    }
                });
            }

            currentPositions.forEach((pos, id) => {
                updateEdgesForNode(
                    id,
                    pos.x,
                    pos.y,
                    nodes,
                    edgePathRefs.current,
                    currentPositions
                );
            });

            // ─────────────────────────────────────
            // STEP 5: GUIDES
            // ─────────────────────────────────────
            const vGuide = document.getElementById("snap-guide-v");
            const hGuide = document.getElementById("snap-guide-h");

            if (vGuide) {
                if (bestGuideX !== null) {
                    vGuide.setAttribute("x1", bestGuideX.toString());
                    vGuide.setAttribute("x2", bestGuideX.toString());
                    vGuide.style.display = "block";
                    vGuide.style.stroke = hierarchicalX ? "#22c55e" : "#a855f7";
                } else {
                    vGuide.style.display = "none";
                }
            }

            if (hGuide) {
                if (bestGuideY !== null) {
                    hGuide.setAttribute("y1", bestGuideY.toString());
                    hGuide.setAttribute("y2", bestGuideY.toString());
                    hGuide.style.display = "block";
                    hGuide.style.stroke = hierarchicalY ? "#22c55e" : "#a855f7";
                } else {
                    hGuide.style.display = "none";
                }
            }

            // ── STEP 6: Reparenting Detection (Overlap) ──
            const OVERLAP_THRESHOLD = 30;
            let newTargetParentId: string | null = null;

            // Find nodes NOT being dragged and NOT descendants of anything being dragged
            const beingDraggedIds = new Set(selectedNodeIds);
            beingDraggedIds.add(d.nodeId);

            // Helper: get all descendants
            const getDescendants = (parentId: string): Set<string> => {
                const desc = new Set<string>();
                const find = (pid: string) => {
                    nodes.forEach(n => {
                        if (n.parentId === pid) {
                            desc.add(n._id);
                            find(n._id);
                        }
                    });
                };
                find(parentId);
                return desc;
            };

            const forbiddenNodes = new Set<string>(beingDraggedIds);
            beingDraggedIds.forEach(id => {
                getDescendants(id).forEach(dId => forbiddenNodes.add(dId));
            });

            const potentialParents = nodes.filter(n => !forbiddenNodes.has(n._id));

            for (const target of potentialParents) {
                const tx = target.x;
                const ty = target.y;
                // Intersection check
                if (finalX < tx + NODE_W - OVERLAP_THRESHOLD &&
                    finalX + NODE_W > tx + OVERLAP_THRESHOLD &&
                    finalY < ty + NODE_H - OVERLAP_THRESHOLD &&
                    finalY + NODE_H > ty + OVERLAP_THRESHOLD) {
                    newTargetParentId = target._id;
                    break;
                }
            }

            // Apply visual feedback (DOM)
            if (d.targetParentId !== newTargetParentId) {
                if (d.targetParentId) {
                    const prev = document.getElementById(`node-rect-${d.targetParentId}`);
                    if (prev) prev.classList.remove("drop-target");
                }
                if (newTargetParentId) {
                    const curr = document.getElementById(`node-rect-${newTargetParentId}`);
                    if (curr) curr.classList.add("drop-target");
                }
                d.targetParentId = newTargetParentId;
            }

            drag.rafId = null;
        });
    }, [getStore]);

    // Helper to update edges
    function updateEdgesForNode(
        nodeId: string,
        newX: number,
        newY: number,
        nodes: any[],
        edgeRefs: Map<string, SVGPathElement>,
        currentPositions?: Map<string, { x: number; y: number }>
    ) {
        const node = nodes.find((n) => n._id === nodeId);
        if (!node) return;

        const NODE_W = 160;
        const NODE_H_HALF = 22;

        const parentEdgePath = edgeRefs.get(nodeId);
        if (parentEdgePath) {
            const parent = nodes.find((n) => n._id === node.parentId);
            if (parent) {
                // Use temporary position if parent is also being dragged
                const pPos = currentPositions?.get(parent._id) || { x: parent.x, y: parent.y };
                const startX = pPos.x + NODE_W;
                const startY = pPos.y + NODE_H_HALF;
                const endX = newX;
                const endY = newY + NODE_H_HALF;
                const controlX = (startX + endX) / 2;
                parentEdgePath.setAttribute(
                    "d",
                    `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`
                );
            }
        }

        const children = nodes.filter((n) => n.parentId === nodeId);
        for (const child of children) {
            const childEdgePath = edgeRefs.get(child._id);
            if (childEdgePath) {
                // Use temporary position if child is also being dragged
                const cPos = currentPositions?.get(child._id) || { x: child.x, y: child.y };
                const startX = newX + NODE_W;
                const startY = newY + NODE_H_HALF;
                const endX = cPos.x;
                const endY = cPos.y + NODE_H_HALF;
                const controlX = (startX + endX) / 2;
                childEdgePath.setAttribute(
                    "d",
                    `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`
                );
            }
        }
    }

    const onMouseUp = useCallback(() => {
        const drag = dragRef.current;
        if (!drag) return;

        // Clear snap guides
        const vGuide = document.getElementById("snap-guide-v");
        const hGuide = document.getElementById("snap-guide-h");
        if (vGuide) vGuide.style.display = "none";
        if (hGuide) hGuide.style.display = "none";

        if (drag.rafId !== null) {
            cancelAnimationFrame(drag.rafId);
            drag.rafId = null;
        }

        const { finalX, finalY, nodeId, startNodeX, startNodeY } = drag;
        dragRef.current = null;

        // Calculate delta
        const dx = finalX - startNodeX;
        const dy = finalY - startNodeY;

        // Clear feedback and dragging classes
        const { selectedNodeIds } = useEditorStore.getState();

        selectedNodeIds.forEach(id => {
            document.getElementById(`node-group-${id}`)?.classList.remove("dragging");
        });
        drag.nodeGroupEl.classList.remove("dragging");

        // Clear all edge dragging classes
        document.querySelectorAll("path.edge-path.dragging").forEach(el => {
            el.classList.remove("dragging");
        });

        if (drag.targetParentId) {
            const el = document.getElementById(`node-rect-${drag.targetParentId}`);
            if (el) el.classList.remove("drop-target");
        }

        if (dx === 0 && dy === 0 && !drag.targetParentId) return;

        const { commitDragEnd, commitBatchDragEnd, reparentNodes, nodes } = useEditorStore.getState();

        if (drag.targetParentId) {
            const nodesToReparent = selectedNodeIds.has(nodeId) ? Array.from(selectedNodeIds) : [nodeId];
            reparentNodes(nodesToReparent, drag.targetParentId);
        } else if (selectedNodeIds.size > 1 && selectedNodeIds.has(nodeId)) {
            // Batch commit
            const updates: { id: string; x: number; y: number }[] = [];
            selectedNodeIds.forEach(id => {
                const node = nodes.find(n => n._id === id);
                if (node) {
                    updates.push({
                        id,
                        x: node.x + dx,
                        y: node.y + dy
                    });
                }
            });
            commitBatchDragEnd(updates);
        } else {
            // Single commit
            commitDragEnd(nodeId, finalX, finalY);
        }
    }, []);

    const isDragging = useCallback(() => dragRef.current !== null, []);

    return { onNodeMouseDown, onMouseMove, onMouseUp, registerEdge, isDragging };
}
