import { useEditorStore } from "../../store/editorStore";

// Mini canvas dimensions
const MINI_W = 120;
const MINI_H = 75;



const NODE_W = 160;
const NODE_H = 44;

export default function MiniNavigator() {
    const nodes = useEditorStore((s) => s.nodes);
    const zoom = useEditorStore((s) => s.zoom);
    const panOffset = useEditorStore((s) => s.panOffset);

    // The canvas origin in SVG space is (800 + panOffset.x, 600 + panOffset.y)
    // A node at (nx, ny) in world space maps to SVG space as:
    //   svgX = (800 + panOffset.x) + nx * zoom
    //   svgY = (600 + panOffset.y) + ny * zoom
    // In mini-map space (0..CANVAS_W → 0..MINI_W):
    //   miniX = svgX * SX
    //   miniY = svgY * SY

    // Viewport rectangle: the visible SVG area is 0..1600 x 0..1200
    // In mini-map that's the full area, so we show the viewport as the
    // inverse: what portion of world space is visible.
    // Visible world X range: (-800 - panOffset.x)/zoom .. (800 - panOffset.x)/zoom
    // In SVG space: 0..1600, 0..1200 — so viewport rect in mini is always full area.
    // Instead, show where the viewport window sits relative to the world content.

    // Compute viewport rect in mini-map coords
    // Viewport in SVG coords: (0,0) to (1600,1200)
    // Viewport in world coords: (-800-panX)/zoom to (800-panX)/zoom
    const vpWorldX = (-800 - panOffset.x) / zoom;
    const vpWorldY = (-600 - panOffset.y) / zoom;
    const vpWorldW = 1600 / zoom;
    const vpWorldH = 1200 / zoom;

    // Find world bounding box of all nodes to normalize mini-map
    const allX = nodes.flatMap(n => [n.x, n.x + NODE_W]);
    const allY = nodes.flatMap(n => [n.y, n.y + NODE_H]);
    const worldMinX = nodes.length ? Math.min(...allX, vpWorldX) - 100 : -400;
    const worldMinY = nodes.length ? Math.min(...allY, vpWorldY) - 100 : -300;
    const worldMaxX = nodes.length ? Math.max(...allX, vpWorldX + vpWorldW) + 100 : 400;
    const worldMaxY = nodes.length ? Math.max(...allY, vpWorldY + vpWorldH) + 100 : 300;
    const worldW = worldMaxX - worldMinX || 1;
    const worldH = worldMaxY - worldMinY || 1;

    const toMiniX = (wx: number) => ((wx - worldMinX) / worldW) * MINI_W;
    const toMiniY = (wy: number) => ((wy - worldMinY) / worldH) * MINI_H;

    // Viewport rect in mini coords
    const vpMiniX = toMiniX(vpWorldX);
    const vpMiniY = toMiniY(vpWorldY);
    const vpMiniW = (vpWorldW / worldW) * MINI_W;
    const vpMiniH = (vpWorldH / worldH) * MINI_H;

    return (
        <div style={{
            position: "fixed", bottom: "16px", left: "16px",
            background: "#1e293b", border: "1px solid #334155",
            borderRadius: "10px", padding: "8px",
            zIndex: 40, fontFamily: "Inter, sans-serif",
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}>
            {/* Mini canvas */}
            <svg
                width={MINI_W}
                height={MINI_H}
                style={{ display: "block", borderRadius: "6px", background: "#0f172a" }}
            >
                {/* Node dots */}
                {nodes.map((node) => (
                    <rect
                        key={node._id}
                        x={toMiniX(node.x)}
                        y={toMiniY(node.y)}
                        width={Math.max(2, (NODE_W / worldW) * MINI_W)}
                        height={Math.max(2, (NODE_H / worldH) * MINI_H)}
                        rx="1"
                        fill={node.parentId ? "#334155" : "#2563eb"}
                        opacity={0.85}
                    />
                ))}

                {/* Viewport rectangle */}
                <rect
                    x={Math.max(0, vpMiniX)}
                    y={Math.max(0, vpMiniY)}
                    width={Math.min(MINI_W, vpMiniW)}
                    height={Math.min(MINI_H, vpMiniH)}
                    fill="rgba(59,130,246,0.07)"
                    stroke="#3b82f6"
                    strokeWidth="1"
                    rx="2"
                />
            </svg>

            <div style={{
                color: "#4b5563", fontSize: "9px", fontWeight: 700,
                letterSpacing: "0.1em", textAlign: "center",
                marginTop: "5px", textTransform: "uppercase",
            }}>
                Navigator
            </div>
        </div>
    );
}
