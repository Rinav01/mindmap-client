import { useState, useEffect, useRef, memo } from "react";
import { useEditorStore } from "../../store/editorStore";
import type { NodeType } from "../../store/editorStore";
import { useParams } from "react-router-dom";
import { useDragContext } from "../../context/DragContext";

interface Props {
  node: NodeType;
  hasChildren: boolean;
}

// Small icon shown to the left of node text
function NodeIcon({ isRoot }: { isRoot: boolean }) {
  if (isRoot) return (
    <svg width="13" height="13" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
  return (
    <svg width="12" height="12" fill="none" stroke="#9ca3af" strokeWidth="2" viewBox="0 0 24 24" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="16" />
      <line x1="8" y1="12" x2="16" y2="12" />
    </svg>
  );
}

function Node({ node, hasChildren }: Props) {
  const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds);
  const selectNode = useEditorStore((s) => s.selectNode);
  const createNode = useEditorStore((s) => s.createNode);
  const isPanMode = useEditorStore((s) => s.isPanMode);
  const editingNodeId = useEditorStore((s) => s.editingNodeId);
  const startEditing = useEditorStore((s) => s.startEditing);
  const updateNodeText = useEditorStore((s) => s.updateNodeText);
  const cancelEditing = useEditorStore((s) => s.cancelEditing);
  const toggleNodeCollapse = useEditorStore((s) => s.toggleNodeCollapse);

  // Drag engine from context — no Zustand subscription needed
  const dragEngine = useDragContext();

  // Ref to the outer <g> so the drag engine can mutate its transform directly
  const groupRef = useRef<SVGGElement>(null);
  const clickStartRef = useRef<{ x: number; y: number } | null>(null);

  const { id } = useParams();

  const isRoot = !node.parentId;
  const isSelected = selectedNodeIds.has(node._id);
  const isEditing = editingNodeId === node._id;
  const [editText, setEditText] = useState(node.text);
  const [isHovered, setIsHovered] = useState(false);

  // Pop animation on mount
  const [scale, setScale] = useState(0.5);
  const [opacity, setOpacity] = useState(0);
  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setScale(1);
      setOpacity(1);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleSave = () => {
    if (editText.trim()) {
      updateNodeText(node._id, editText.trim());
    } else {
      cancelEditing();
    }
  };

  // Visual config
  const NODE_W = 160;
  const NODE_H = 44;
  const cx = NODE_W / 2;
  const cy = NODE_H / 2;

  // Root: blue gradient fill; child: dark fill
  const fillColor = node.color
    ? node.color
    : isRoot
      ? "#2563eb"
      : "#1e293b";

  const strokeColor = isSelected
    ? "#60a5fa"
    : isHovered
      ? isRoot ? "#60a5fa" : "#64748b"
      : isRoot
        ? "#3b82f6"
        : "#334155";

  const strokeWidth = isSelected ? 2 : isHovered ? 1.5 : 1.5;

  return (
    // Outer <g> gets the ref — the drag engine mutates its transform attribute directly
    <g
      id={`node-group-${node._id}`}
      ref={groupRef}
      transform={`translate(${node.x}, ${node.y})`}
    >
      {/* Collapse/Expand Toggle (only if children exist) */}
      {hasChildren && (
        <g
          transform={`translate(${NODE_W + 12}, ${NODE_H / 2})`}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggleNodeCollapse(node._id);
          }}
          style={{ cursor: "pointer" }}
        >
          <circle r="8" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
          {node.collapsed ? (
            // Plus icon
            <g stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round">
              <line x1="-3" y1="0" x2="3" y2="0" />
              <line x1="0" y1="-3" x2="0" y2="3" />
            </g>
          ) : (
            // Minus icon or chevron
            <g stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round">
              {/* Use a simple dot or chevron? Let's use a minus for expand */}
              {/* actually, conventionally: - means expanded (can collapse), + means collapsed (can expand) */}
              {/* The mock UI used a chevron. Let's stick to standard tree view: - / + */}
              <line x1="-3" y1="0" x2="3" y2="0" />
            </g>
          )}
        </g>
      )}
      {/* Pop animation wrapper */}
      <g
        style={{
          opacity,
          cursor: isPanMode ? "grab" : (isEditing ? "text" : "grab"),
          transform: `translate(${cx}px, ${cy}px) scale(${scale}) translate(${-cx}px, ${-cy}px)`,
          transition:
            "opacity 0.28s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.28s cubic-bezier(0.34, 1.56, 0.64, 1)",
        }}
        onMouseDown={(e) => {
          // In pan mode, let the event bubble to the canvas to handle panning.
          if (isPanMode) return;

          clickStartRef.current = { x: e.clientX, y: e.clientY };
          if (!isEditing && groupRef.current) {
            e.stopPropagation();
            // Hand off to the drag engine — no Zustand write
            dragEngine.onNodeMouseDown(node._id, node.x, node.y, groupRef.current, e);
          }
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Glow halo when selected */}
        {isSelected && (
          <rect
            width={NODE_W}
            height={NODE_H}
            rx="10"
            fill="none"
            stroke="#60a5fa"
            strokeWidth="8"
            opacity="0.18"
            style={{ filter: "blur(5px)" }}
          />
        )}

        {/* Root node bottom accent line */}
        {isRoot && (
          <rect
            x={NODE_W * 0.3}
            y={NODE_H - 4}
            width={NODE_W * 0.4}
            height={3}
            rx="2"
            fill="rgba(255,255,255,0.35)"
          />
        )}

        {/* Main rect */}
        <rect
          width={NODE_W}
          height={NODE_H}
          rx="10"
          fill={fillColor}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          style={{ transition: "stroke 0.2s, fill 0.2s" }}
          onClick={(e) => {
            if (isPanMode) return;
            e.stopPropagation();
            if (clickStartRef.current) {
              const dx = e.clientX - clickStartRef.current.x;
              const dy = e.clientY - clickStartRef.current.y;
              if (Math.sqrt(dx * dx + dy * dy) > 10) return;
            }
            if (!isEditing) selectNode(node._id, e.shiftKey);
          }}
          onDoubleClick={(e) => {
            if (isPanMode) return;
            e.stopPropagation();
            startEditing(node._id);
            setEditText(node.text);
          }}
        />

        {isEditing ? (
          <foreignObject x="0" y="0" width={NODE_W} height={NODE_H}>
            <input
              autoFocus
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              onKeyDown={(e) => {
                e.stopPropagation();
                if (e.key === "Enter") handleSave();
                if (e.key === "Escape") cancelEditing();
              }}
              onBlur={handleSave}
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "100%", height: "100%",
                background: "transparent",
                border: "none",
                color: "white",
                fontSize: `${node.fontSize ?? 13}px`,
                textAlign: "center",
                padding: "0 12px",
                outline: "none",
                fontFamily: "Inter, sans-serif",
                fontWeight: isRoot ? 700 : 500,
              }}
            />
          </foreignObject>
        ) : (
          <>
            {/* Clip path to prevent text overflow */}
            <defs>
              <clipPath id={`clip-${node._id}`}>
                <rect x="28" y="0" width={NODE_W - 38} height={NODE_H} />
              </clipPath>
            </defs>
            {/* Icon */}
            <foreignObject x="10" y={(NODE_H - 13) / 2} width="16" height="16">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "16px", height: "16px" }}>
                <NodeIcon isRoot={isRoot} />
              </div>
            </foreignObject>
            {/* Text — clipped to node width */}
            <text
              x={cx + 6}
              y={cy + 1}
              textAnchor="middle"
              dominantBaseline="middle"
              fill="white"
              fontSize={node.fontSize ?? 13}
              fontWeight={isRoot ? 700 : 500}
              fontFamily="Inter, sans-serif"
              pointerEvents="none"
              clipPath={`url(#clip-${node._id})`}
            >
              {node.text}
              <title>{node.text}</title>
            </text>
          </>
        )}

        {/* Add child button */}
        {isSelected && !isEditing && (
          <circle
            cx={NODE_W + 10}
            cy={cy}
            r="8"
            fill="#2563eb"
            stroke="#60a5fa"
            strokeWidth="1.5"
            style={{ cursor: "pointer" }}
            onClick={(e) => {
              if (isPanMode) return;
              e.stopPropagation();
              if (id) createNode(id, node);
            }}
          />
        )}
      </g>
    </g>
  );
}

const MemoizedNode = memo(Node);
export default MemoizedNode;
