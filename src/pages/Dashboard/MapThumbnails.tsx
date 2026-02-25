// ─── Map Card SVG Thumbnails ──────────────────────────────────────────────────
// Selected by node count tier:
//   Tier 0 (1–3 nodes):  simple  — root + 2 children     [blue]
//   Tier 1 (4–8 nodes):  medium  — 2-level tree, 3 branches [purple]
//   Tier 2 (9+ nodes):   dense   — 3-level tree, 4+ branches [green]

// Shared node/edge colours
const NODE_FILL = "#1e293b";
const NODE_STROKE = "#334155";

export const TIER_COLORS = ["#3b82f6", "#7c3aed", "#059669"] as const;

/** Returns the correct tier index (0 | 1 | 2) for a given node count. */
export function getTier(nodeCount: number): 0 | 1 | 2 {
    return nodeCount <= 3 ? 0 : nodeCount <= 8 ? 1 : 2;
}

// ─── Tier 0: simple (1–3 nodes) ──────────────────────────────────────────────
export function ThumbnailSimple() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none">
            <rect x="70" y="42" width="60" height="28" rx="8" fill="#2563eb" opacity="0.9" />
            <rect x="16" y="84" width="52" height="22" rx="6" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <rect x="132" y="84" width="52" height="22" rx="6" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <line x1="100" y1="70" x2="42" y2="84" stroke={NODE_STROKE} strokeWidth="1.5" />
            <line x1="100" y1="70" x2="158" y2="84" stroke={NODE_STROKE} strokeWidth="1.5" />
        </svg>
    );
}

// ─── Tier 1: medium (4–8 nodes) ──────────────────────────────────────────────
export function ThumbnailMedium() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none">
            <rect x="75" y="14" width="50" height="24" rx="7" fill="#7c3aed" opacity="0.85" />
            <rect x="10" y="58" width="44" height="20" rx="6" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <rect x="66" y="58" width="44" height="20" rx="6" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <rect x="146" y="58" width="44" height="20" rx="6" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <rect x="18" y="90" width="36" height="17" rx="5" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <rect x="74" y="90" width="36" height="17" rx="5" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <line x1="100" y1="38" x2="32" y2="58" stroke={NODE_STROKE} strokeWidth="1.2" />
            <line x1="100" y1="38" x2="88" y2="58" stroke={NODE_STROKE} strokeWidth="1.2" />
            <line x1="100" y1="38" x2="168" y2="58" stroke={NODE_STROKE} strokeWidth="1.2" />
            <line x1="32" y1="78" x2="36" y2="90" stroke={NODE_STROKE} strokeWidth="1" />
            <line x1="88" y1="78" x2="92" y2="90" stroke={NODE_STROKE} strokeWidth="1" />
        </svg>
    );
}

// ─── Tier 2: dense (9+ nodes) ─────────────────────────────────────────────────
export function ThumbnailDense() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 200 120" fill="none">
            <rect x="80" y="6" width="40" height="20" rx="6" fill="#059669" opacity="0.9" />
            <rect x="8" y="38" width="36" height="17" rx="5" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <rect x="54" y="38" width="36" height="17" rx="5" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <rect x="110" y="38" width="36" height="17" rx="5" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <rect x="156" y="38" width="36" height="17" rx="5" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <rect x="4" y="68" width="28" height="14" rx="4" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <rect x="36" y="68" width="28" height="14" rx="4" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <rect x="70" y="68" width="28" height="14" rx="4" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <rect x="110" y="68" width="28" height="14" rx="4" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <rect x="156" y="68" width="28" height="14" rx="4" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <rect x="18" y="96" width="24" height="13" rx="4" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <rect x="76" y="96" width="24" height="13" rx="4" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <rect x="114" y="96" width="24" height="13" rx="4" fill={NODE_FILL} stroke={NODE_STROKE} strokeWidth="1" />
            <line x1="100" y1="26" x2="26" y2="38" stroke={NODE_STROKE} strokeWidth="1" />
            <line x1="100" y1="26" x2="72" y2="38" stroke={NODE_STROKE} strokeWidth="1" />
            <line x1="100" y1="26" x2="128" y2="38" stroke={NODE_STROKE} strokeWidth="1" />
            <line x1="100" y1="26" x2="174" y2="38" stroke={NODE_STROKE} strokeWidth="1" />
            <line x1="26" y1="55" x2="18" y2="68" stroke={NODE_STROKE} strokeWidth="1" />
            <line x1="26" y1="55" x2="50" y2="68" stroke={NODE_STROKE} strokeWidth="1" />
            <line x1="72" y1="55" x2="84" y2="68" stroke={NODE_STROKE} strokeWidth="1" />
            <line x1="128" y1="55" x2="124" y2="68" stroke={NODE_STROKE} strokeWidth="1" />
            <line x1="174" y1="55" x2="170" y2="68" stroke={NODE_STROKE} strokeWidth="1" />
            <line x1="18" y1="82" x2="30" y2="96" stroke={NODE_STROKE} strokeWidth="1" />
            <line x1="84" y1="82" x2="88" y2="96" stroke={NODE_STROKE} strokeWidth="1" />
            <line x1="124" y1="82" x2="126" y2="96" stroke={NODE_STROKE} strokeWidth="1" />
        </svg>
    );
}

/** All three thumbnails indexed by tier — use `getTier(nodeCount)` to pick one. */
export const THUMBNAILS = [
    <ThumbnailSimple key="t0" />,
    <ThumbnailMedium key="t1" />,
    <ThumbnailDense key="t2" />,
];
