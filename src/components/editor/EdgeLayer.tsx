import { useEditorStore } from "../../store/editorStore";
import { useDragContext } from "../../context/DragContext";

export default function EdgeLayer() {
  return (
    <defs>
      {/* Glow filter for selected edges */}
      <filter id="edge-glow" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}


export function EdgeLayerPaths() {
  const nodes = useEditorStore((s) => s.nodes);
  const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds);
  const { registerEdge } = useDragContext();

  // Precompute visibility set
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

  return (
    <>
      {nodes.map((node) => {
        if (!node.parentId) return null;
        if (!visibleNodeIds.has(node._id)) return null;

        const parent = nodes.find(
          (n) => n._id === node.parentId
        );

        if (!parent) return null;

        const startX = parent.x + 160; // right edge of parent
        const startY = parent.y + 22;   // vertical center
        const endX = node.x;            // left edge of child
        const endY = node.y + 22;

        const controlX = (startX + endX) / 2;

        // Highlight edge if either endpoint is selected
        const isHighlighted =
          selectedNodeIds.has(node._id) ||
          selectedNodeIds.has(node.parentId);

        return (
          <path
            key={node._id}
            // Callback ref: registers this DOM element with the drag engine
            ref={(el) => registerEdge(node._id, el)}
            d={`M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`}
            stroke={isHighlighted ? "#818cf8" : "#555"}
            strokeWidth={isHighlighted ? 2.5 : 1.5}
            fill="none"
            filter={isHighlighted ? "url(#edge-glow)" : undefined}
            style={{
              transition: "stroke 0.2s ease, stroke-width 0.2s ease",
            }}
          />
        );
      })}
    </>
  );
}
