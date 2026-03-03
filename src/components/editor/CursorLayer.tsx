import { useRef, useEffect, useCallback } from "react";
import { useEditorStore } from "../../store/editorStore";
import type { LiveCursor } from "../../store/editorStore";

// Each cursor tracks its own interpolated position via refs
function InterpolatedCursor({ id, cursor }: { id: string; cursor: LiveCursor }) {
    const gRef = useRef<SVGGElement>(null);
    const currentPos = useRef({ x: cursor.x, y: cursor.y });
    const targetPos = useRef({ x: cursor.x, y: cursor.y });
    const rafId = useRef<number>(0);

    // Update target whenever cursor data changes
    useEffect(() => {
        targetPos.current = { x: cursor.x, y: cursor.y };
    }, [cursor.x, cursor.y]);

    // rAF interpolation loop
    const animate = useCallback(() => {
        const ease = 0.25;
        const dx = targetPos.current.x - currentPos.current.x;
        const dy = targetPos.current.y - currentPos.current.y;

        // Only update DOM if there's meaningful movement
        if (Math.abs(dx) > 0.1 || Math.abs(dy) > 0.1) {
            currentPos.current.x += dx * ease;
            currentPos.current.y += dy * ease;
        } else {
            currentPos.current.x = targetPos.current.x;
            currentPos.current.y = targetPos.current.y;
        }

        if (gRef.current) {
            gRef.current.setAttribute(
                "transform",
                `translate(${currentPos.current.x}, ${currentPos.current.y})`
            );
        }

        rafId.current = requestAnimationFrame(animate);
    }, []);

    useEffect(() => {
        rafId.current = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId.current);
    }, [animate]);

    return (
        <g ref={gRef} transform={`translate(${cursor.x}, ${cursor.y})`}>
            {/* Cursor Arrow */}
            <path
                d="M5.65376 21.0069L2.14664 2.87272C1.72583 0.697672 4.1979 -0.803452 5.9529 0.565457L21.4111 12.6247C23.0125 13.8739 22.396 16.4463 20.3552 16.9632L14.0734 18.5539C13.2796 18.755 12.6373 19.349 12.3551 20.1415L9.95462 26.8837C9.22744 28.9255 6.20816 28.3243 5.65376 21.0069Z"
                fill={cursor.color}
                stroke="#ffffff"
                strokeWidth="2"
            />
            {/* Name tag */}
            <g transform="translate(14, 20)">
                <rect
                    x="0"
                    y="0"
                    width={cursor.name.length * 7 + 16}
                    height="22"
                    rx="11"
                    fill={cursor.color}
                    opacity="0.92"
                />
                <text
                    x="8"
                    y="15"
                    fontSize="11"
                    fontWeight="600"
                    fill="#ffffff"
                    fontFamily="Inter, sans-serif"
                    style={{ pointerEvents: "none" }}
                >
                    {cursor.name}
                </text>
            </g>
        </g>
    );
}

export default function CursorLayer() {
    const liveCursors = useEditorStore((s) => s.liveCursors);

    return (
        <g style={{ pointerEvents: "none" }}>
            {Object.entries(liveCursors).map(([id, cursor]) => (
                <InterpolatedCursor key={id} id={id} cursor={cursor} />
            ))}
        </g>
    );
}
