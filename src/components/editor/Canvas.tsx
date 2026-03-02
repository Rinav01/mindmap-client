import { useRef, useState, useEffect } from "react";
import EdgeLayer, { EdgeLayerPaths } from "./EdgeLayer";
import NodeLayer from "./NodeLayer";
import CursorLayer from "./CursorLayer";
import { useEditorStore } from "../../store/editorStore";
import { useAuthStore } from "../../store/authStore";
import { useDragEngine } from "../../hooks/useDragEngine";
import { DragProvider } from "../../context/DragContext";
import { socketService } from "../../services/socket";

export default function Canvas() {
    const zoom = useEditorStore((s) => s.zoom);
    const setZoom = useEditorStore((s) => s.setZoom);
    const isPanning = useEditorStore((s) => s.isPanning);
    const isPanMode = useEditorStore((s) => s.isPanMode);
    const panOffset = useEditorStore((s) => s.panOffset);
    const startPan = useEditorStore((s) => s.startPan);
    const updatePan = useEditorStore((s) => s.updatePan);
    const endPan = useEditorStore((s) => s.endPan);
    const deselectAll = useEditorStore((s) => s.deselectAll);

    const selectNodes = useEditorStore((s) => s.selectNodes);
    const nodes = useEditorStore((s) => s.nodes);

    const svgRef = useRef<SVGSVGElement>(null);
    const [spacePressed, setSpacePressed] = useState(false);
    const currentZoomRef = useRef(zoom);
    const currentPanRef = useRef(panOffset);
    const velocityRef = useRef({ x: 0, y: 0 });
    const lastMousePosRef = useRef({ x: 0, y: 0 });
    const isInteractingRef = useRef(false);

    // Lasso State
    const [isLassoActive, setIsLassoActive] = useState(false);
    const [lassoStart, setLassoStart] = useState({ x: 0, y: 0 });
    const [lassoEnd, setLassoEnd] = useState({ x: 0, y: 0 });

    const user = useAuthStore((s) => s.user);
    const lastCursorEmitRef = useRef(0);

    // Instantiate the high-performance drag engine
    const dragEngine = useDragEngine();

    // SMOOTH PHYSICS LOOP
    useEffect(() => {
        let rafId: number;

        const animate = () => {

            const spring = 0.18;
            const friction = 0.94;

            // 1. Zoom Interpolation
            currentZoomRef.current += (zoom - currentZoomRef.current) * spring;

            // 2. Pan Interpolation & Inertia
            if (isInteractingRef.current) {
                // When manual panning, just follow the store (panning updates store)
                currentPanRef.current.x += (panOffset.x - currentPanRef.current.x) * 0.4;
                currentPanRef.current.y += (panOffset.y - currentPanRef.current.y) * 0.4;
            } else {
                // Apply inertia
                currentPanRef.current.x += velocityRef.current.x;
                currentPanRef.current.y += velocityRef.current.y;
                velocityRef.current.x *= friction;
                velocityRef.current.y *= friction;

                // Sync store to inertia position?
                // Actually, let's spring towards store, and only use velocity when store isn't being updated.
                // Better: The store IS the target. If velocity is high, we update the store.
                // For now, let's keep it simple: Spring towards store.
                currentPanRef.current.x += (panOffset.x - currentPanRef.current.x) * spring;
                currentPanRef.current.y += (panOffset.y - currentPanRef.current.y) * spring;
            }

            // 3. Direct DOM Update
            const group = document.getElementById("canvas-world-group");
            if (group) {
                group.setAttribute(
                    "transform",
                    `translate(${800 + currentPanRef.current.x}, ${600 + currentPanRef.current.y}) scale(${currentZoomRef.current})`
                );
            }

            rafId = requestAnimationFrame(animate);
        };

        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, [zoom, panOffset]);

    // Keyboard listeners for space key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !spacePressed) {
                const activeTag = document.activeElement?.tagName.toLowerCase();
                if (activeTag === 'input' || activeTag === 'textarea') return;

                e.preventDefault();
                setSpacePressed(true);
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.code === 'Space') {
                setSpacePressed(false);
                endPan();
            }
        };

        const handleBlur = () => {
            setSpacePressed(false);
            endPan();
        };

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);
        window.addEventListener('blur', handleBlur);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
            window.removeEventListener('blur', handleBlur);
        };
    }, [spacePressed, endPan]);

    const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        if (e.button !== 0 && e.button !== 1) return;
        e.preventDefault();

        if (spacePressed || isPanMode || e.button === 1) {
            isInteractingRef.current = true;
            velocityRef.current = { x: 0, y: 0 };
            startPan();
            lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        } else {
            if (!dragEngine.isDragging()) {
                const pt = getSVGPoint(e.clientX, e.clientY);
                setLassoStart(pt);
                setLassoEnd(pt);
                setIsLassoActive(true);
            }
        }
    };

    const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
        if (e.target === e.currentTarget && !isPanning && !dragEngine.isDragging() && !isLassoActive) {
            deselectAll();
        }
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (isPanning && !isLassoActive) {
            e.preventDefault();
            const deltaX = e.clientX - lastMousePosRef.current.x;
            const deltaY = e.clientY - lastMousePosRef.current.y;

            // Track velocity for inertia
            velocityRef.current = { x: deltaX, y: deltaY };

            updatePan(deltaX, deltaY);
            lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        } else if (isLassoActive) {
            const pt = getSVGPoint(e.clientX, e.clientY);
            setLassoEnd(pt);
        } else {
            dragEngine.onMouseMove(e);
        }

        // Emit live cursor location (throttled to 50ms = 20hz)
        const now = performance.now();
        if (now - lastCursorEmitRef.current > 50 && user) {
            const pt = getSVGPoint(e.clientX, e.clientY);
            const color = user.color || "#3b82f6"; // Pick a default or deterministic color if needed

            // Console log tracking emission
            // console.log("Emitting cursor:", {x: pt.x, y: pt.y, name: user.name, color});

            socketService.emitCursorMoved(pt.x, pt.y, user.name || "Anonymous", color);
            lastCursorEmitRef.current = now;
        }
    };

    const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
        isInteractingRef.current = false;
        if (isPanning) {
            endPan();
        } else if (isLassoActive) {
            setIsLassoActive(false);
            const finalEnd = getSVGPoint(e.clientX, e.clientY);
            const x = Math.min(lassoStart.x, finalEnd.x);
            const y = Math.min(lassoStart.y, finalEnd.y);
            const w = Math.abs(lassoStart.x - finalEnd.x);
            const h = Math.abs(lassoStart.y - finalEnd.y);

            if (w < 5 && h < 5) {
                deselectAll();
                return;
            }

            const childrenMap = new Map<string | null, typeof nodes>();
            nodes.forEach(node => {
                const pId = node.parentId;
                if (!childrenMap.has(pId)) childrenMap.set(pId, []);
                childrenMap.get(pId)?.push(node);
            });

            const visibleNodeIds = new Set<string>();
            const traverse = (parentId: string | null) => {
                const children = childrenMap.get(parentId);
                if (!children) return;
                for (const child of children) {
                    visibleNodeIds.add(child._id);
                    if (!child.collapsed) traverse(child._id);
                }
            };
            traverse(null);

            const selectedIds: string[] = [];
            nodes.forEach(node => {
                if (!visibleNodeIds.has(node._id)) return;
                if (x < node.x + 160 && x + w > node.x &&
                    y < node.y + 44 && y + h > node.y) {
                    selectedIds.push(node._id);
                }
            });

            if (selectedIds.length > 0) {
                selectNodes(selectedIds, e.shiftKey);
            } else if (!e.shiftKey) {
                deselectAll();
            }
        } else {
            dragEngine.onMouseUp();
        }
    };

    useEffect(() => {
        const svgEl = svgRef.current;
        if (!svgEl) return;

        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            // Smoother wheel: just update target in store, RAF handles transition
            const zoomSpeed = 0.0015;
            const newZoom = zoom * (1 - e.deltaY * zoomSpeed);
            setZoom(Math.max(0.1, Math.min(3, newZoom)));
        };

        svgEl.addEventListener('wheel', onWheel, { passive: false });
        return () => svgEl.removeEventListener('wheel', onWheel);
    }, [zoom, setZoom]);

    // Helper to get SVG coordinates
    const getSVGPoint = (clientX: number, clientY: number) => {
        if (!svgRef.current) return { x: 0, y: 0 };
        const pt = svgRef.current.createSVGPoint();
        pt.x = clientX;
        pt.y = clientY;

        // Map Client -> Group Space using CTM
        const group = document.getElementById("canvas-world-group") as unknown as SVGGElement;
        if (group) {
            const ctm = group.getScreenCTM();
            if (ctm) {
                const inverse = ctm.inverse();
                const worldPt = pt.matrixTransform(inverse);
                return { x: worldPt.x, y: worldPt.y };
            }
        }

        return { x: 0, y: 0 };
    };

    return (
        <DragProvider value={dragEngine}>
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="0 0 1600 1200"
                style={{
                    background: "#1a1a1a",
                    cursor: (spacePressed || isPanMode) ? "grab" : "default",
                    touchAction: "none",
                    userSelect: "none"
                }}
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            // onWheel removed from here, handled in effect
            >
                {/* SVG filter defs (glow effect for edges) */}
                <EdgeLayer />

                {/* Viewport wrapper for zoom/pan */}
                <g
                    id="canvas-world-group"
                    transform={`translate(${800 + panOffset.x}, ${600 + panOffset.y}) scale(${zoom})`}
                >
                    <EdgeLayerPaths />
                    <NodeLayer />
                    <CursorLayer />

                    {/* Lasso Selection Box */}
                    {isLassoActive && (
                        <rect
                            x={Math.min(lassoStart.x, lassoEnd.x)}
                            y={Math.min(lassoStart.y, lassoEnd.y)}
                            width={Math.abs(lassoStart.x - lassoEnd.x)}
                            height={Math.abs(lassoStart.y - lassoEnd.y)}
                            fill="rgba(59, 130, 246, 0.1)"
                            stroke="#3b82f6"
                            strokeWidth="1"
                            strokeDasharray="4 2"
                        />
                    )}

                    {/* Snapping Guides */}
                    <line
                        id="snap-guide-v"
                        x1="0" y1="-10000" x2="0" y2="10000"
                        stroke="#a855f7"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        style={{ display: "none", pointerEvents: "none" }}
                    />
                    <line
                        id="snap-guide-h"
                        x1="-10000" y1="0" x2="10000" y2="0"
                        stroke="#a855f7"
                        strokeWidth="1.5"
                        strokeDasharray="4 4"
                        style={{ display: "none", pointerEvents: "none" }}
                    />
                </g>
            </svg>
        </DragProvider>
    );
}
