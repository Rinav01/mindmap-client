import { useRef, useState, useEffect } from "react";
import EdgeLayer, { EdgeLayerPaths } from "./EdgeLayer";
import NodeLayer from "./NodeLayer";
import { useEditorStore } from "../../store/editorStore";
import { useDragEngine } from "../../hooks/useDragEngine";
import { DragProvider } from "../../context/DragContext";

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
    const lastMousePosRef = useRef({ x: 0, y: 0 });

    // Lasso State
    const [isLassoActive, setIsLassoActive] = useState(false);
    const [lassoStart, setLassoStart] = useState({ x: 0, y: 0 });
    const [lassoEnd, setLassoEnd] = useState({ x: 0, y: 0 });

    // Instantiate the high-performance drag engine
    const dragEngine = useDragEngine();

    // Keyboard listeners for space key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !spacePressed) {
                // Don't prevent default here if you want to allow typing spaces in inputs!
                // But since we are in Canvas, maybe we should check activeElement?
                // For now, if we are editing a node, the input captures the event and stops propagation?
                // The input in Node.tsx has onKeyDown checking for Enter/Escape but not stopping propagation for Space?
                // Node.tsx input does NOT stop propagation for other keys.
                // But Canvas keyboard listeners are on 'window'.
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
        // Prevent default browser drag behavior (e.g. dragging the SVG as an image)
        // This is important to prevent "ghost" drags
        if (e.button !== 0 && e.button !== 1) return; // Only allow left or middle click

        // Actually, let's just prevent default always for background clicks
        e.preventDefault();

        if (spacePressed || isPanMode || e.button === 1) { // Middle click always pans
            startPan();
            lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        } else {
            // Start Lasso
            if (!dragEngine.isDragging()) {
                const pt = getSVGPoint(e.clientX, e.clientY);
                setLassoStart(pt);
                setLassoEnd(pt);
                setIsLassoActive(true);
            }
        }
    };

    const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
        // Deselect when clicking canvas background (not panning or dragging)
        if (e.target === e.currentTarget && !isPanning && !dragEngine.isDragging() && !isLassoActive) {
            deselectAll();
        }
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if (isPanning && !isLassoActive) {
            e.preventDefault();
            // Pan mode — still uses Zustand (pan is infrequent, not per-pixel-hot)
            const deltaX = e.clientX - lastMousePosRef.current.x;
            const deltaY = e.clientY - lastMousePosRef.current.y;
            updatePan(deltaX, deltaY);
            lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        } else if (isLassoActive) {
            const pt = getSVGPoint(e.clientX, e.clientY);
            setLassoEnd(pt);
        } else {
            // Node drag mode — zero Zustand writes
            dragEngine.onMouseMove(e);
        }
    };

    const handleMouseUp = (e: React.MouseEvent<SVGSVGElement>) => {
        if (isPanning) {
            endPan();
        } else if (isLassoActive) {
            // Commit Lasso
            setIsLassoActive(false);

            // Use fresh coordinates for the end point to ensure accuracy
            const finalEnd = getSVGPoint(e.clientX, e.clientY);

            // Calculate intersection
            // Normalizing rect
            const x = Math.min(lassoStart.x, finalEnd.x);
            const y = Math.min(lassoStart.y, finalEnd.y);
            const w = Math.abs(lassoStart.x - finalEnd.x);
            const h = Math.abs(lassoStart.y - finalEnd.y);

            if (w < 5 && h < 5) {
                // Treat as click if very small movement
                deselectAll();
                return;
            }

            // Simple AABB intersection
            const NODE_W = 160;
            const NODE_H = 44;

            // Precompute visibility set (same logic as NodeLayer/EdgeLayer)
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
                // Ignore hidden nodes
                if (!visibleNodeIds.has(node._id)) return;

                // Node rect
                const nx = node.x;
                const ny = node.y;
                const nw = NODE_W;
                const nh = NODE_H;

                // Check overlap
                if (x < nx + nw && x + w > nx &&
                    y < ny + nh && y + h > ny) {
                    selectedIds.push(node._id);
                }
            });

            if (selectedIds.length > 0) {
                selectNodes(selectedIds, e.shiftKey); // Support Shift to add
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
            const delta = e.deltaY > 0 ? -0.1 : 0.1;
            setZoom(zoom + delta);
        };

        // React 18+ defaults wheel to passive, so we must add listener manually to preventDefault
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
                </g>
            </svg>
        </DragProvider>
    );
}
