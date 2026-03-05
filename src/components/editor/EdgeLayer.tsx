import { useMemo } from "react";
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

      {/* Animation for connection flow */}
      <style>{`
        @keyframes edge-flow {
          to {
            stroke-dashoffset: -20;
          }
        }
        .edge-flow-path {
          stroke-dasharray: 4 16;
          animation: edge-flow 1s linear infinite;
        }
        @keyframes edge-breathing {
          0% { opacity: 0.15; stroke-width: 6; filter: blur(3px); }
          50% { opacity: 0.35; stroke-width: 10; filter: blur(6px); }
          100% { opacity: 0.15; stroke-width: 6; filter: blur(3px); }
        }
        .edge-halo {
          animation: edge-breathing 2.5s ease-in-out infinite;
        }
      `}</style>
    </defs>
  );
}


export function EdgeLayerPaths() {
  const nodes = useEditorStore((s) => s.nodes);
  const selectedNodeIds = useEditorStore((s) => s.selectedNodeIds);
  const isLayoutAnimating = useEditorStore((s) => s.isLayoutAnimating);
  const { registerEdge } = useDragContext();
  const focusNodeId = useEditorStore((s) => s.focusNodeId);

  // Stable BFS subtree — useMemo so Set reference doesn't change every render
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

  // Find effective roots: parentId is null OR parent does not exist in current node set
  const nodeIds = new Set(nodes.map(n => n._id));
  const effectiveRoots = nodes.filter(n => !n.parentId || !nodeIds.has(n.parentId));

  effectiveRoots.forEach(root => {
    visibleNodeIds.add(root._id);
    if (!root.collapsed) {
      traverse(root._id);
    }
  });


  return (
    <g style={{
      opacity: isLayoutAnimating ? 0 : 1,
      transition: 'opacity 0.2s ease',
      pointerEvents: isLayoutAnimating ? 'none' : 'auto'
    }}>
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
        const d = `M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`;

        const isFaded = !!focusNodeId && !focusedSubtree.has(node._id);

        // Highlight edge if either endpoint is selected
        const isHighlighted =
          selectedNodeIds.has(node._id) ||
          selectedNodeIds.has(node.parentId);

        return (
          <g key={node._id}>
            {/* Halo background (breathing) */}
            {isHighlighted && !isFaded && (
              <path
                d={d}
                className="edge-halo"
                stroke="#818cf8"
                strokeWidth={8}
                fill="none"
                style={{ pointerEvents: 'none' }}
              />
            )}

            {/* Background path (static line) */}
            <path
              id={`edge-${node._id}`}
              ref={(el) => registerEdge(node._id, el)}
              d={d}
              stroke={isHighlighted ? "#818cf8" : "#555"}
              strokeWidth={isHighlighted ? 2.5 : 1.5}
              fill="none"
              filter={isHighlighted ? "url(#edge-glow)" : undefined}
              style={{
                opacity: isFaded ? 0.15 : 1,
                transition: isLayoutAnimating
                  ? 'none'
                  : 'opacity 0.28s ease, stroke 0.4s ease, stroke-width 0.4s ease, d 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)',
              }}
            />
            {/* Overlay flow path (animated dashes) */}
            <path
              d={d}
              className="edge-flow-path"
              stroke={isHighlighted ? "#a5b4fc" : "#888"}
              strokeWidth={1.5}
              fill="none"
              style={{
                opacity: isFaded ? 0.05 : (isHighlighted ? 0.8 : 0.4),
                pointerEvents: 'none',
                transition: isLayoutAnimating
                  ? 'none'
                  : 'opacity 0.4s ease, stroke 0.4s ease, d 0.3s cubic-bezier(0.2, 0.8, 0.2, 1)'
              }}
            />
          </g>
        );
      })}
    </g>
  );
}
