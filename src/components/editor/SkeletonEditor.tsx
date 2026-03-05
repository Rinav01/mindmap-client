// CSS-in-JS pulse animation injected globally (once)
const pulseCss = `
@keyframes pulseGlow {
  0% { opacity: 0.6; }
  50% { opacity: 0.3; }
  100% { opacity: 0.6; }
}
.skeleton-pulse {
  animation: pulseGlow 1.5s ease-in-out infinite;
}
`;

export default function SkeletonEditor() {
    return (
        <div style={{ width: "100vw", height: "100vh", background: "#0a0f18", position: "relative", overflow: "hidden" }}>
            <style>{pulseCss}</style>

            {/* Grid Pattern Background */}
            <svg width="100%" height="100%" style={{ position: "absolute", inset: 0, opacity: 0.1 }}>
                <pattern id="skeleton-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <circle cx="2" cy="2" r="1.5" fill="#9ca3af" />
                </pattern>
                <rect width="100%" height="100%" fill="url(#skeleton-grid)" />
            </svg>

            {/* Fake Header */}
            <header className="skeleton-pulse" style={{
                position: "absolute", top: 0, left: 0, right: 0, height: "52px",
                background: "#111827", borderBottom: "1px solid #1f2937",
                display: "flex", alignItems: "center", padding: "0 16px", zIndex: 10,
                justifyContent: "space-between"
            }}>
                {/* Logo / Title Area Placeholder */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "28px", height: "28px", background: "#1f2937", borderRadius: "7px" }} />
                    <div style={{ width: "120px", height: "16px", background: "#1f2937", borderRadius: "4px" }} />
                </div>
                {/* Actions Placeholder */}
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "70px", height: "28px", background: "#1f2937", borderRadius: "8px" }} />
                    <div style={{ width: "32px", height: "32px", background: "#1f2937", borderRadius: "50%" }} />
                </div>
            </header>

            {/* Fake Toolbar */}
            <div className="skeleton-pulse" style={{
                position: "absolute", left: "20px", top: "72px",
                width: "48px", height: "220px", background: "#111827",
                border: "1px solid #1f2937", borderRadius: "12px", zIndex: 10
            }} />

            {/* Fake Nodes Group (Centered) */}
            <div className="skeleton-pulse" style={{
                position: "absolute", top: "50%", left: "50%",
                transform: "translate(-50%, -50%)",
                width: "600px", height: "400px",
            }}>
                {/* Root Node Container Placeholder */}
                <div style={{
                    position: "absolute", top: "180px", left: "200px",
                    width: "200px", height: "50px", background: "#1e3a5f",
                    border: "2px solid #3b82f6", borderRadius: "10px",
                    boxShadow: "0 4px 12px rgba(59, 130, 246, 0.15)"
                }} />

                {/* Child Node 1 Placeholder */}
                <div style={{
                    position: "absolute", top: "60px", left: "450px",
                    width: "140px", height: "40px", background: "#1f2937",
                    borderRadius: "8px"
                }} />

                {/* Child Node 2 Placeholder */}
                <div style={{
                    position: "absolute", top: "300px", left: "450px",
                    width: "160px", height: "40px", background: "#1f2937",
                    borderRadius: "8px"
                }} />

                {/* Connecting Line 1 Placeholder */}
                <svg width="600" height="400" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
                    <path d="M400 205 C 420 205, 420 80, 450 80" stroke="#334155" strokeWidth="4" fill="none" />
                    <path d="M400 205 C 420 205, 420 320, 450 320" stroke="#334155" strokeWidth="4" fill="none" />
                </svg>

            </div>
        </div>
    );
}
