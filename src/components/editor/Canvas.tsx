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
    const selectNode = useEditorStore((s) => s.selectNode);

    const svgRef = useRef<SVGSVGElement>(null);
    const [spacePressed, setSpacePressed] = useState(false);
    const lastMousePosRef = useRef({ x: 0, y: 0 });

    // Instantiate the high-performance drag engine
    const dragEngine = useDragEngine();

    // Keyboard listeners for space key
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.code === 'Space' && !spacePressed) {
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

        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('keyup', handleKeyUp);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('keyup', handleKeyUp);
        };
    }, [spacePressed, endPan]);

    const handleMouseDown = (e: React.MouseEvent<SVGSVGElement>) => {
        if (spacePressed || isPanMode) {
            startPan();
            lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        }
    };

    const handleClick = (e: React.MouseEvent<SVGSVGElement>) => {
        // Deselect when clicking canvas background (not panning or dragging)
        if (e.target === e.currentTarget && !isPanning && !dragEngine.isDragging()) {
            selectNode("");
        }
    };

    const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
        if ((spacePressed || isPanMode) && isPanning) {
            // Pan mode — still uses Zustand (pan is infrequent, not per-pixel-hot)
            const deltaX = e.clientX - lastMousePosRef.current.x;
            const deltaY = e.clientY - lastMousePosRef.current.y;
            updatePan(deltaX, deltaY);
            lastMousePosRef.current = { x: e.clientX, y: e.clientY };
        } else {
            // Node drag mode — zero Zustand writes
            dragEngine.onMouseMove(e);
        }
    };

    const handleMouseUp = () => {
        if (isPanning) {
            endPan();
        } else {
            dragEngine.onMouseUp();
        }
    };

    const handleWheel = (e: React.WheelEvent<SVGSVGElement>) => {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -0.1 : 0.1;
        setZoom(zoom + delta);
    };

    return (
        <DragProvider value={dragEngine}>
            <svg
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="0 0 1600 1200"
                style={{ background: "#1a1a1a", cursor: (spacePressed || isPanMode) ? "grab" : "default" }}
                onClick={handleClick}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
                onWheel={handleWheel}
            >
                {/* SVG filter defs (glow effect for edges) */}
                <EdgeLayer />

                {/* Viewport wrapper for zoom/pan */}
                <g transform={`translate(${800 + panOffset.x}, ${600 + panOffset.y}) scale(${zoom})`}>
                    <EdgeLayerPaths />
                    <NodeLayer />
                </g>
            </svg>
        </DragProvider>
    );
}
