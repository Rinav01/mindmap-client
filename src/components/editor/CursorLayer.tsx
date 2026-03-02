import { useEditorStore } from "../../store/editorStore";

export default function CursorLayer() {
    const liveCursors = useEditorStore((s) => s.liveCursors);

    return (
        <g style={{ pointerEvents: "none" }}>
            {Object.entries(liveCursors).map(([id, cursor]) => (
                <g
                    key={id}
                    // Use standard CSS transitions for smooth cursor movement
                    style={{
                        transform: `translate(${cursor.x}px, ${cursor.y}px)`,
                        transition: "transform 0.05s linear",
                        willChange: "transform"
                    }}
                >
                    {/* Cursor Arrow */}
                    <path
                        d="M5.65376 21.0069L2.14664 2.87272C1.72583 0.697672 4.1979 -0.803452 5.9529 0.565457L21.4111 12.6247C23.0125 13.8739 22.396 16.4463 20.3552 16.9632L14.0734 18.5539C13.2796 18.755 12.6373 19.349 12.3551 20.1415L9.95462 26.8837C9.22744 28.9255 6.20816 28.3243 5.65376 21.0069Z"
                        fill={cursor.color}
                        stroke="#ffffff"
                        strokeWidth="2"
                    />
                    {/* Name tag pointing exactly to the tip */}
                    <g transform="translate(14, 20)">
                        <rect
                            x="0"
                            y="0"
                            width={cursor.name.length * 8 + 16}
                            height="24"
                            rx="12"
                            fill={cursor.color}
                        />
                        <text
                            x="8"
                            y="16"
                            fontSize="12"
                            fontWeight="600"
                            fill="#ffffff"
                            fontFamily="Inter, sans-serif"
                            style={{ pointerEvents: "none" }}
                        >
                            {cursor.name}
                        </text>
                    </g>
                </g>
            ))}
        </g>
    );
}
