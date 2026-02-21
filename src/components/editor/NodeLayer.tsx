import { useEditorStore } from "../../store/editorStore";
import Node from "./Node";

export default function NodeLayer() {
  const nodes = useEditorStore((s) => s.nodes);

  if (nodes.length === 0) {
    return (
      <g>
        <text
          x={0} y={-60}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#334155"
          fontSize={15}
          fontFamily="Inter, sans-serif"
          fontWeight={500}
        >
          Loading your mind map...
        </text>
      </g>
    );
  }

  // Show hint when only root node exists (brand new map)
  const isNewMap = nodes.length === 1;
  const root = nodes[0];


  // Precompute parent -> children map for O(1) lookup
  const childrenMap = new Map<string | null, typeof nodes>();
  nodes.forEach(node => {
    const pId = node.parentId;
    if (!childrenMap.has(pId)) childrenMap.set(pId, []);
    childrenMap.get(pId)?.push(node);
  });

  // Recursive visibility filter
  const visibleNodes: typeof nodes = [];
  const traverse = (parentId: string | null) => {
    const children = childrenMap.get(parentId);
    if (!children) return;

    for (const child of children) {
      visibleNodes.push(child);
      // Only traverse deeper if NOT collapsed
      if (!child.collapsed) {
        traverse(child._id);
      }
    }
  };
  traverse(null); // Start with roots

  return (
    <>
      {visibleNodes.map((node) => (
        <Node
          key={node._id}
          node={node}
          hasChildren={childrenMap.has(node._id)}
        />
      ))}

      {/* Empty state hint for new maps with only root node */}
      {isNewMap && root && (
        <g transform={`translate(${root.x + 180}, ${root.y + 5})`}>
          {/* Arrow pointing left toward the node's add button */}
          <path
            d="M -10 17 Q -30 17 -30 17"
            stroke="#334155"
            strokeWidth="1.5"
            fill="none"
            strokeDasharray="4 3"
            markerEnd="url(#arrowhead)"
          />
          <defs>
            <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
              <path d="M 0 0 L 6 3 L 0 6 Z" fill="#334155" />
            </marker>
          </defs>
          <rect x="0" y="0" width="160" height="34" rx="8"
            fill="#1e293b" stroke="#334155" strokeWidth="1" strokeDasharray="4 3" />
          <text x="80" y="12" textAnchor="middle" fill="#64748b"
            fontSize={11} fontFamily="Inter, sans-serif" fontWeight={600}>
            Click ⊕ to add a node
          </text>
          <text x="80" y="26" textAnchor="middle" fill="#475569"
            fontSize={10} fontFamily="Inter, sans-serif">
            or select a node and press Tab
          </text>
        </g>
      )}
    </>
  );
}
