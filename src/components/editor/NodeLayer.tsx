import { useMemo } from "react";
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

  const visibleNodes: { node: typeof nodes[0], index: number }[] = [];
  const traverse = (parentId: string | null) => {
    const children = childrenMap.get(parentId);
    if (!children) return;

    children.forEach((child, index) => {
      visibleNodes.push({ node: child, index });
      if (!child.collapsed) {
        traverse(child._id);
      }
    });
  };

  // Find effective roots: parentId is null OR parent does not exist in current node set
  const nodeIds = new Set(nodes.map(n => n._id));
  const effectiveRoots = nodes.filter(n => !n.parentId || !nodeIds.has(n.parentId));

  effectiveRoots.forEach((root, index) => {
    visibleNodes.push({ node: root, index });
    if (!root.collapsed) {
      traverse(root._id);
    }
  });

  const focusNodeId = useEditorStore((s) => s.focusNodeId);

  // Compute focused subtree via BFS — memoized so the Set reference stays stable
  const focusedSubtree = useMemo(() => {
    if (!focusNodeId) return new Set<string>();
    const result = new Set<string>();
    const queue = [focusNodeId];
    const childrenLookup = new Map<string, string[]>();
    nodes.forEach(n => {
      if (n.parentId) {
        if (!childrenLookup.has(n.parentId)) childrenLookup.set(n.parentId, []);
        childrenLookup.get(n.parentId)!.push(n._id);
      }
    });
    while (queue.length > 0) {
      const id = queue.shift()!;
      result.add(id);
      const kids = childrenLookup.get(id);
      if (kids) queue.push(...kids);
    }
    return result;
  }, [nodes, focusNodeId]);

  return (
    <>
      {visibleNodes.map(({ node, index }) => (
        <Node
          key={node._id}
          node={node}
          hasChildren={childrenMap.has(node._id)}
          siblingIndex={index}
          isFaded={!!focusNodeId && !focusedSubtree.has(node._id)}
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
