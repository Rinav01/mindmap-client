// ─── Map Card SVG Thumbnails (Screenshot Accurate) ─────────────────────────────
// Recreated perfectly from the provided reference screenshot.
import type { Map } from "../../store/mapsStore";

export const TIER_COLORS = ["#8b949e", "#8083ff", "#c0c1ff"] as const;

export function getTier(nodeCount: number): 0 | 1 | 2 {
    return nodeCount <= 5 ? 0 : nodeCount <= 15 ? 1 : 2;
}

// ─── Shared Base Defs ────────────────────────────────────────────────────────
const SvgDefs = () => (
    <defs>
        <pattern id="gridPattern" width="30" height="30" patternUnits="userSpaceOnUse">
            <path d="M 30 0 L 0 0 0 30" fill="none" stroke="rgba(255, 255, 255, 0.03)" strokeWidth="1" />
        </pattern>
        <pattern id="dotsPattern" width="16" height="16" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1" fill="rgba(255,255,255,0.05)" />
        </pattern>
        <pattern id="diagonalStripes" width="10" height="10" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
            <rect width="2" height="10" fill="rgba(255,255,255,0.02)" />
        </pattern>
        <linearGradient id="glowGradBlue" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8083ff" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0.2" />
        </linearGradient>
        <linearGradient id="glowGradPurple" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#c0c1ff" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.3" />
        </linearGradient>
        <linearGradient id="glassNode" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="rgba(255,255,255,0.08)" />
            <stop offset="100%" stopColor="rgba(255,255,255,0.01)" />
        </linearGradient>
        <filter id="neonGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
            </feMerge>
        </filter>
        <filter id="softShadow" x="-10%" y="-10%" width="120%" height="120%">
            <feDropShadow dx="0" dy="8" stdDeviation="6" floodColor="#000" floodOpacity="0.5" />
        </filter>
    </defs>
);

// ─── "Daily Brainstorm" (Hollow Square) ──────────────────────────────────────
export function ThumbnailBrainstorm() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
            <SvgDefs />
            <rect width="100%" height="100%" fill="#101216" />
            
            <g transform="translate(150, 80) scale(0.75) translate(-150, -80)">
                <g transform="translate(150, 80)">
                    <rect x="-24" y="-24" width="48" height="48" rx="8" fill="transparent" stroke="#b0b3ff" strokeWidth="3" filter="url(#neonGlow)" />
                    <rect x="-24" y="-24" width="48" height="48" rx="8" fill="rgba(176,179,255,0.05)" />
                </g>
            </g>
        </svg>
    );
}

// ─── "Product Roadmap 2024" (3 Pills Tree) ───────────────────────────────────
export function ThumbnailRoadmap() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
            <SvgDefs />
            <rect width="100%" height="100%" fill="#101216" />
            
            <g transform="translate(150, 80) scale(0.9) translate(-150, -80)">
                <g transform="translate(45, 3)">
                    {/* Top Pill */}
                    <rect x="0" y="0" width="120" height="44" rx="22" fill="#282936" stroke="rgba(255,255,255,0.04)" strokeWidth="1" filter="url(#softShadow)" />
                    <circle cx="24" cy="22" r="6" fill="#80caff" />
                    <rect x="42" y="19" width="45" height="6" rx="3" fill="#3e3f4f" />

                    {/* Middle Pill */}
                    <rect x="70" y="55" width="140" height="44" rx="22" fill="#2e2f3c" stroke="rgba(255,255,255,0.04)" strokeWidth="1" filter="url(#softShadow)" />
                    <circle cx="94" cy="77" r="6" fill="#d8b4fe" />
                    <rect x="112" y="74" width="65" height="6" rx="3" fill="#454659" />

                    {/* Bottom Pill */}
                    <rect x="25" y="110" width="100" height="44" rx="22" fill="#262734" stroke="rgba(255,255,255,0.04)" strokeWidth="1" filter="url(#softShadow)" />
                    <circle cx="49" cy="132" r="6" fill="#c4a5ff" />
                    <rect x="67" y="129" width="35" height="6" rx="3" fill="#3c3d4e" />
                </g>
            </g>
        </svg>
    );
}

// ─── "Marketing Strategy" (4 Rows of Icon Pills) ─────────────────────────────
export function ThumbnailMarketing() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
            <SvgDefs />
            <rect width="100%" height="100%" fill="#0a0b0d" />
            
            <g transform="translate(150, 80) scale(0.9) translate(-150, -80)">
                <g transform="translate(35, 25)">
                    {/* Block 1: Megaphone */}
                    <rect x="0" y="0" width="110" height="50" rx="6" fill="#1b1c23" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                    <g transform="translate(10, 15)">
                        <path d="M4 6 L8 6 L12 2 L12 16 L8 12 L4 12 Z" fill="#ffb4a6"/>
                        <path d="M15 5 Q17 9 15 13" stroke="#ffb4a6" strokeWidth="2" fill="none" strokeLinecap="round"/>
                        <path d="M17 3 Q20 9 17 15" stroke="#ffb4a6" strokeWidth="2" fill="none" strokeLinecap="round"/>
                    </g>
                    <rect x="35" y="23" width="60" height="4" rx="2" fill="#2b2d38" />

                    {/* Block 2: Chart */}
                    <rect x="120" y="0" width="110" height="50" rx="6" fill="#1b1c23" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                    <g transform="translate(130, 15)">
                        <rect x="0" y="0" width="16" height="16" rx="2" fill="#7dd3fc" />
                        <rect x="3" y="8" width="3" height="5" fill="#101216" rx="0.5"/>
                        <rect x="7" y="4" width="3" height="9" fill="#101216" rx="0.5"/>
                        <rect x="11" y="6" width="3" height="7" fill="#101216" rx="0.5"/>
                    </g>
                    <rect x="155" y="23" width="60" height="4" rx="2" fill="#2b2d38" />

                    {/* Block 3: Rocket */}
                    <rect x="0" y="60" width="110" height="50" rx="6" fill="#1b1c23" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                    <g transform="translate(9, 74) scale(0.8)">
                         <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" fill="#e9d5ff"/>
                         <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" fill="#e9d5ff"/>
                         <circle cx="15" cy="9" r="1.5" fill="#1b1c23" />
                    </g>
                    <rect x="35" y="83" width="60" height="4" rx="2" fill="#2b2d38" />

                    {/* Block 4: Nodes */}
                    <rect x="120" y="60" width="110" height="50" rx="6" fill="#1b1c23" stroke="rgba(255,255,255,0.02)" strokeWidth="1" />
                    <g transform="translate(130, 75)">
                        <circle cx="8" cy="8" r="3" fill="#e9d5ff" />
                        <circle cx="2" cy="2" r="2" fill="#e9d5ff" />
                        <circle cx="14" cy="2" r="2" fill="#e9d5ff" />
                        <circle cx="2" cy="14" r="2" fill="#e9d5ff" />
                        <circle cx="14" cy="14" r="2" fill="#e9d5ff" />
                        <path d="M2 2 L8 8 M14 2 L8 8 M2 14 L8 8 M14 14 L8 8" stroke="#e9d5ff" strokeWidth="1.5" />
                    </g>
                    <rect x="155" y="83" width="60" height="4" rx="2" fill="#2b2d38" />
                </g>
            </g>
        </svg>
    );
}

// ─── "Cognitive Mapping v2" (Dense 2x2 - Vertical Block) ─────────────────────
export function ThumbnailDenseBlock() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 200 400" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
            <SvgDefs />
            <rect width="100%" height="100%" fill="#0a0b0d" />
            <rect width="100%" height="100%" fill="url(#diagonalStripes)" />
            
            <g transform="translate(100, 200) scale(0.75) translate(-100, -200)">
                <g transform="translate(40, 180)">
                    <rect x="-10" y="-80" width="120" height="240" rx="12" fill="#101216" filter="url(#softShadow)" />
                    
                    {/* 3 Glowing horizontal bars inside */}
                    <rect x="10" y="-10" width="80" height="6" rx="3" fill="#4B5563" />
                    <rect x="10" y="5" width="50" height="6" rx="3" fill="#3b4255" />
                    <rect x="10" y="20" width="70" height="6" rx="3" fill="#3b4255" />
                    <rect x="10" y="-10" width="80" height="6" rx="3" fill="none" stroke="rgba(140, 179, 255, 0.3)" filter="url(#neonGlow)" />
                </g>
            </g>
        </svg>
    );
}

// ─── Original Thumbnail Restorations ───────────────────────────────────────────
export function ThumbnailSimple() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 300 160" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
            <SvgDefs />
            <rect width="100%" height="100%" fill="#12141a" />
            <rect width="100%" height="100%" fill="url(#gridPattern)" />
            
            <g transform="translate(150, 80) scale(0.75) translate(-150, -80)">
                <g transform="translate(150, 60)">
                    {/* Lines */}
                    <path d="M 0 0 L -60 40 M 0 0 L 60 40" stroke="rgba(192, 193, 255, 0.4)" strokeWidth="1.5" fill="none" />
                    {/* Data stream dots */}
                    <circle cx="-30" cy="20" r="2" fill="#8083ff" filter="url(#neonGlow)" />
                    <circle cx="30" cy="20" r="2" fill="#8083ff" filter="url(#neonGlow)" />
                    
                    {/* Children nodes */}
                    <rect x="-80" y="30" width="40" height="20" rx="4" fill="url(#glassNode)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" filter="url(#softShadow)" />
                    <rect x="40" y="30" width="40" height="20" rx="4" fill="url(#glassNode)" stroke="rgba(255,255,255,0.1)" strokeWidth="1" filter="url(#softShadow)" />
                    
                    {/* Root node */}
                    <rect x="-35" y="-15" width="70" height="30" rx="6" fill="url(#glowGradBlue)" filter="url(#softShadow)" />
                    <rect x="-35" y="-15" width="70" height="30" rx="6" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="1" />
                </g>
            </g>
        </svg>
    );
}

export function ThumbnailMedium() {
    return (
        <svg width="100%" height="100%" viewBox="0 0 300 220" preserveAspectRatio="xMidYMid slice" style={{ display: 'block' }}>
            <SvgDefs />
            <rect width="100%" height="100%" fill="#0f1115" />
            <rect width="100%" height="100%" fill="url(#dotsPattern)" />
            
            <g transform="translate(150, 110) scale(0.75) translate(-150, -110)">
                <g transform="translate(150, 40)">
                    {/* Hexagon background orbit */}
                    <circle cx="0" cy="50" r="80" fill="none" stroke="rgba(255,255,255,0.02)" strokeWidth="20" />
                    <circle cx="0" cy="50" r="80" fill="none" stroke="rgba(192, 193, 255, 0.1)" strokeWidth="1" strokeDasharray="4 8" />
                    
                    {/* Connectivity */}
                    <path d="M 0 0 C 0 40, -90 30, -90 70 M 0 0 C 0 40, 0 30, 0 70 M 0 0 C 0 40, 90 30, 90 70" stroke="rgba(192, 193, 255, 0.3)" strokeWidth="1.5" fill="none" />
                    <path d="M -90 70 C -90 100, -110 100, -110 130 M -90 70 C -90 100, -70 100, -70 130 M 90 70 C 90 110, 90 110, 90 130" stroke="rgba(192, 193, 255, 0.2)" strokeWidth="1" fill="none" />
                    
                    {/* Secondary Layers */}
                    <rect x="-110" y="60" width="40" height="20" rx="4" fill="url(#glassNode)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" filter="url(#softShadow)" />
                    <rect x="-20" y="60" width="40" height="20" rx="4" fill="url(#glassNode)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" filter="url(#softShadow)" />
                    <rect x="70" y="60" width="40" height="20" rx="4" fill="url(#glassNode)" stroke="rgba(255,255,255,0.15)" strokeWidth="1" filter="url(#softShadow)" />
                    
                    {/* Tertiary Base */}
                    <circle cx="-110" cy="130" r="6" fill="#8083ff" opacity="0.5" filter="url(#neonGlow)" />
                    <circle cx="-70" cy="130" r="6" fill="#8083ff" opacity="0.5" filter="url(#neonGlow)" />
                    <circle cx="90" cy="130" r="6" fill="#8083ff" opacity="0.6" filter="url(#neonGlow)" />

                    {/* Core Nexus */}
                    <polygon points="0,-20 20,0 0,20 -20,0" fill="url(#glowGradPurple)" filter="url(#softShadow)" />
                    <polygon points="0,-20 20,0 0,20 -20,0" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1" filter="url(#neonGlow)" />
                </g>
            </g>
        </svg>
    );
}

export function getThumbnailForMap(map: Map, tier: number) {
    // Generate deterministic pseudo-random index using map _id
    let charVal = 0;
    if (map._id && map._id.length > 0) charVal = map._id.charCodeAt(map._id.length - 1);

    if (tier === 2) {
        return <ThumbnailDenseBlock />;
    }
    if (tier === 0) {
        return charVal % 2 === 0 ? <ThumbnailBrainstorm /> : <ThumbnailSimple />;
    }
    
    // Mix the tier 1 SVGs deterministically so the dashboard looks varied
    const choice = charVal % 3;
    if (choice === 0) return <ThumbnailMarketing />;
    if (choice === 1) return <ThumbnailRoadmap />;
    return <ThumbnailMedium />;
}
