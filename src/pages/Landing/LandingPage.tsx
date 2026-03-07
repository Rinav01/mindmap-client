import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    motion,
    useScroll,
    useTransform,
    useInView,
} from "framer-motion";
import { useAuthStore } from "../../store/authStore";

/* ─── animation variants ─── */
const fadeUp = {
    hidden: { opacity: 0, y: 40 },
    show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
};

const fadeIn = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { duration: 0.6 } },
};

const stagger = (delay = 0.1) => ({
    hidden: {},
    show: { transition: { staggerChildren: delay } },
});

const cardVariant = {
    hidden: { opacity: 0, y: 30, scale: 0.97 },
    show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
};

/* ─── reusable animated section wrapper ─── */
function AnimatedSection({
    children,
    className,
    style,
    delay = 0,
    amount = 0.2,
}: {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    delay?: number;
    amount?: number;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const isInView = useInView(ref, { once: false, amount });

    return (
        <motion.div
            ref={ref}
            initial="hidden"
            animate={isInView ? "show" : "hidden"}
            variants={fadeUp}
            transition={{ delay }}
            className={className}
            style={style}
        >
            {children}
        </motion.div>
    );
}

/* ─── constants ─── */
const NAV_LINKS = ["Features", "Templates", "Pricing", "Resources"];
const LOGOS = ["TechStack", "OrbitAI", "GreenFlow", "Cryptic", "LayerUp"];
const FEATURES = [
    {
        icon: (
            <svg width="22" height="22" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24">
                <rect x="3" y="3" width="18" height="18" rx="3" />
                <path d="M12 8v8M8 12h8" />
            </svg>
        ),
        title: "Infinite Canvas",
        desc: "Never run out of space. Expand your thoughts in any direction on a high-performance canvas that scales with your ambition.",
    },
    {
        icon: (
            <svg width="22" height="22" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="6" cy="12" r="3" />
                <circle cx="18" cy="6" r="3" />
                <circle cx="18" cy="18" r="3" />
                <path d="M9 10.5l6-3M9 13.5l6 3" />
            </svg>
        ),
        title: "Intuitive Node Linking",
        desc: "Connect ideas naturally with smart snapping and automated layout engines that keep your mind maps organised without effort.",
    },
    {
        icon: (
            <svg width="22" height="22" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2a10 10 0 1 0 10 10" />
                <polyline points="12 6 12 12 16 14" />
                <path d="M22 2l-5 5M17 2h5v5" />
            </svg>
        ),
        title: "Real-time Auto-save",
        desc: "Focus on your ideas, not the save button. Every stroke is synced instantly across all your devices with end-to-end encryption.",
    },
    {
        icon: (
            <svg width="22" height="22" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
        ),
        title: "Real-time Collaboration",
        desc: "See your teammates' cursors live, get notified of edits, and co-create with role-based permissions — all in real time.",
    },
    {
        icon: (
            <svg width="22" height="22" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
            </svg>
        ),
        title: "AI Mind Map Generation",
        desc: "Type a topic and let Groq's Llama 3 70B model generate a fully structured, hierarchical mind map in seconds.",
    },
    {
        icon: (
            <svg width="22" height="22" fill="none" stroke="#3b82f6" strokeWidth="2" viewBox="0 0 24 24">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
        ),
        title: "Multi-format Export",
        desc: "Export your maps as PNG, PDF, JSON, or Markdown. Share your thinking anywhere, in any format.",
    },
];

/* ─── animated canvas preview ─── */
function CanvasPreview() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const nodes = [
            { x: 300, y: 200, label: "MindFlow", r: 38, color: "#3b82f6" },
            { x: 155, y: 120, label: "Collaborate", r: 27, color: "#6366f1" },
            { x: 445, y: 115, label: "AI Generate", r: 27, color: "#8b5cf6" },
            { x: 100, y: 275, label: "Export", r: 23, color: "#06b6d4" },
            { x: 500, y: 275, label: "Focus Mode", r: 23, color: "#10b981" },
            { x: 255, y: 335, label: "Templates", r: 23, color: "#f59e0b" },
            { x: 385, y: 345, label: "History", r: 23, color: "#ec4899" },
        ];
        const edges = [[0, 1], [0, 2], [1, 3], [0, 4], [0, 5], [0, 6]];

        let frame = 0;
        let raf: number;

        const draw = () => {
            canvas.width = canvas.offsetWidth;
            canvas.height = canvas.offsetHeight;
            const scaleX = canvas.width / 600;
            const scaleY = canvas.height / 420;

            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const pulse = Math.sin(frame * 0.018) * 0.1 + 0.9;

            edges.forEach(([a, b]) => {
                const na = nodes[a], nb = nodes[b];
                ctx.beginPath();
                ctx.moveTo(na.x * scaleX, na.y * scaleY);
                const mx = ((na.x + nb.x) / 2) * scaleX;
                const my = ((na.y + nb.y) / 2 - 20) * scaleY;
                ctx.quadraticCurveTo(mx, my, nb.x * scaleX, nb.y * scaleY);
                ctx.strokeStyle = "rgba(99,102,241,0.4)";
                ctx.lineWidth = 1.5;
                ctx.stroke();
            });

            nodes.forEach((n, i) => {
                const px = n.x * scaleX, py = n.y * scaleY;
                const pr = n.r * Math.min(scaleX, scaleY);
                const pulsed = i === 0 ? pr * pulse : pr;

                const grd = ctx.createRadialGradient(px, py, 0, px, py, pulsed * 2.2);
                grd.addColorStop(0, n.color + "40");
                grd.addColorStop(1, "transparent");
                ctx.beginPath();
                ctx.arc(px, py, pulsed * 2.2, 0, Math.PI * 2);
                ctx.fillStyle = grd;
                ctx.fill();

                ctx.beginPath();
                ctx.arc(px, py, pulsed, 0, Math.PI * 2);
                ctx.fillStyle = n.color + "20";
                ctx.strokeStyle = n.color;
                ctx.lineWidth = i === 0 ? 2.5 : 1.5;
                ctx.fill();
                ctx.stroke();

                ctx.fillStyle = "#e2e8f0";
                ctx.font = `${i === 0 ? 600 : 500} ${Math.round(pulsed * 0.42)}px Inter,sans-serif`;
                ctx.textAlign = "center";
                ctx.textBaseline = "middle";
                ctx.fillText(n.label, px, py);
            });

            frame++;
            raf = requestAnimationFrame(draw);
        };

        draw();
        return () => cancelAnimationFrame(raf);
    }, []);

    return <canvas ref={canvasRef} style={{ width: "100%", height: "100%", display: "block" }} />;
}

/* ─── main page ─── */
export default function LandingPage() {
    const navigate = useNavigate();
    const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
    const [scrolled, setScrolled] = useState(false);
    const heroRef = useRef<HTMLDivElement>(null);

    // Parallax: orb moves at 35% window scroll speed
    const { scrollY } = useScroll();
    const orbY = useTransform(scrollY, [0, 600], ["0%", "35%"]);
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0]);

    useEffect(() => {
        const onScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener("scroll", onScroll);
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    const dest = isAuthenticated ? "/dashboard" : "/register";
    const loginDest = isAuthenticated ? "/dashboard" : "/login";

    return (
        <div style={{ minHeight: "100vh", background: "#080c14", color: "#e2e8f0", fontFamily: "'Inter',sans-serif" }}>

            {/* ── Navbar ── */}
            <motion.nav
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                style={{
                    position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
                    height: "60px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    padding: "0 40px",
                    background: scrolled ? "rgba(8,12,20,0.88)" : "transparent",
                    backdropFilter: scrolled ? "blur(14px)" : "none",
                    borderBottom: scrolled ? "1px solid rgba(255,255,255,0.06)" : "none",
                    transition: "background 0.3s, border 0.3s",
                }}
            >
                {/* Logo */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <div style={{
                        width: "30px", height: "30px",
                        background: "linear-gradient(135deg,#3b82f6,#6366f1)",
                        borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
                            <circle cx="12" cy="5" r="3" fill="white" />
                            <circle cx="5" cy="19" r="3" fill="white" />
                            <circle cx="19" cy="19" r="3" fill="white" />
                            <line x1="12" y1="8" x2="5" y2="16" stroke="white" strokeWidth="2" />
                            <line x1="12" y1="8" x2="19" y2="16" stroke="white" strokeWidth="2" />
                        </svg>
                    </div>
                    <span style={{ fontWeight: 700, fontSize: "16px", color: "white" }}>MindFlow</span>
                </div>

                {/* Links */}
                <div style={{ display: "flex", gap: "32px" }}>
                    {NAV_LINKS.map((l, i) => (
                        <motion.a
                            key={l}
                            href="#"
                            initial={{ opacity: 0, y: -6 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 + i * 0.07 }}
                            style={{ color: "#94a3b8", fontSize: "13.5px", fontWeight: 500, textDecoration: "none" }}
                            whileHover={{ color: "#e2e8f0" }}
                        >{l}</motion.a>
                    ))}
                </div>

                {/* Auth buttons */}
                <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <motion.button
                        onClick={() => navigate(loginDest)}
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                        whileHover={{ color: "#ffffff" }}
                        style={{ background: "transparent", border: "none", color: "#94a3b8", fontSize: "13.5px", fontWeight: 500, cursor: "pointer", padding: "6px 14px" }}
                    >Log In</motion.button>
                    <motion.button
                        onClick={() => navigate(dest)}
                        initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.55 }}
                        whileHover={{ scale: 1.05, background: "#2563eb" }}
                        whileTap={{ scale: 0.97 }}
                        style={{ background: "#3b82f6", border: "none", color: "white", fontSize: "13px", fontWeight: 600, cursor: "pointer", padding: "8px 18px", borderRadius: "8px" }}
                    >Start Free</motion.button>
                </div>
            </motion.nav>

            {/* ── Hero ── */}
            <section
                ref={heroRef}
                style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "120px 24px 80px", textAlign: "center", position: "relative", overflow: "hidden" }}
            >
                {/* Parallax orb */}
                <motion.div style={{
                    position: "absolute", top: "10%", left: "50%", translateX: "-50%", y: orbY,
                    width: "700px", height: "420px",
                    background: "radial-gradient(ellipse at center, rgba(99,102,241,0.2) 0%, transparent 65%)",
                    pointerEvents: "none",
                }} />

                <motion.div style={{ opacity: heroOpacity, display: "flex", flexDirection: "column", alignItems: "center", gap: 0 }}>
                    {/* Badge */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.1 }}
                        style={{
                            display: "inline-flex", alignItems: "center", gap: "6px",
                            background: "rgba(99,102,241,0.12)", border: "1px solid rgba(99,102,241,0.3)",
                            borderRadius: "20px", padding: "5px 14px", marginBottom: "28px",
                            fontSize: "12px", color: "#a5b4fc", fontWeight: 500,
                        }}
                    >
                        <motion.span
                            animate={{ scale: [1, 1.4, 1] }}
                            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                            style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#6366f1", display: "inline-block" }}
                        />
                        Now with AI-powered map generation
                    </motion.div>

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] as const }}
                        style={{ fontSize: "clamp(36px,6vw,72px)", fontWeight: 800, lineHeight: 1.08, color: "white", margin: "0 0 20px", maxWidth: "800px", letterSpacing: "-0.03em" }}
                    >
                        Visualize Your Thoughts<br />
                        on an{" "}
                        <span style={{ background: "linear-gradient(90deg,#3b82f6,#a78bfa)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Infinite Canvas</span>
                    </motion.h1>

                    {/* Sub */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.35 }}
                        style={{ fontSize: "17px", color: "#94a3b8", maxWidth: "520px", lineHeight: 1.7, margin: "0 0 36px" }}
                    >
                        MindFlow helps you capture, connect, and organize your ideas in a seamless, infinite workspace. Build complex maps without limits and unlock your creative potential.
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}
                        style={{ display: "flex", gap: "14px", flexWrap: "wrap", justifyContent: "center" }}
                    >
                        <motion.button
                            onClick={() => navigate(dest)}
                            whileHover={{ scale: 1.04, y: -2, boxShadow: "0 0 40px rgba(59,130,246,0.55)" }}
                            whileTap={{ scale: 0.97 }}
                            style={{ background: "#3b82f6", border: "none", color: "white", fontSize: "15px", fontWeight: 600, cursor: "pointer", padding: "14px 28px", borderRadius: "10px", boxShadow: "0 0 28px rgba(59,130,246,0.4)" }}
                        >Start Mapping for Free</motion.button>
                        <motion.button
                            onClick={() => navigate(loginDest)}
                            whileHover={{ scale: 1.03, y: -2, background: "rgba(255,255,255,0.1)" }}
                            whileTap={{ scale: 0.97 }}
                            style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)", color: "#e2e8f0", fontSize: "15px", fontWeight: 500, cursor: "pointer", padding: "14px 24px", borderRadius: "10px", display: "flex", alignItems: "center", gap: "8px" }}
                        >
                            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="10" />
                                <polygon points="10,8 16,12 10,16" fill="currentColor" stroke="none" />
                            </svg>
                            Watch Demo
                        </motion.button>
                    </motion.div>
                </motion.div>

                {/* App preview */}
                <motion.div
                    initial={{ opacity: 0, y: 60, scale: 0.96 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.9, delay: 0.65, ease: [0.22, 1, 0.36, 1] as const }}
                    style={{
                        marginTop: "64px", width: "100%", maxWidth: "860px",
                        background: "rgba(15,23,42,0.8)",
                        border: "1px solid rgba(99,102,241,0.2)",
                        borderRadius: "18px", padding: "6px",
                        boxShadow: "0 40px 100px rgba(0,0,0,0.6), 0 0 0 1px rgba(99,102,241,0.1)",
                        overflow: "hidden",
                    }}
                >
                    {/* Window chrome */}
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", padding: "10px 14px 8px", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                        {["#ff5f57", "#ffbd2e", "#28c840"].map(c => (
                            <div key={c} style={{ width: "10px", height: "10px", borderRadius: "50%", background: c }} />
                        ))}
                        <div style={{ flex: 1, marginLeft: "8px", background: "rgba(255,255,255,0.05)", borderRadius: "6px", height: "22px" }} />
                    </div>
                    {/* Canvas */}
                    <div style={{ height: "340px", position: "relative" }}>
                        <CanvasPreview />
                        {/* Collaborator pills */}
                        <div style={{ position: "absolute", bottom: "14px", left: "14px", display: "flex", gap: "6px" }}>
                            {[{ i: "R", c: "#3b82f6" }, { i: "A", c: "#6366f1" }, { i: "S", c: "#10b981" }].map(u => (
                                <div key={u.i} style={{ width: "28px", height: "28px", borderRadius: "50%", background: u.c, border: "2px solid #0f172a", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "white" }}>{u.i}</div>
                            ))}
                            <div style={{ padding: "4px 10px", borderRadius: "20px", background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.1)", fontSize: "11px", color: "#94a3b8", display: "flex", alignItems: "center" }}>
                                3 collaborating live
                            </div>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ── Trust logos ── */}
            <AnimatedSection style={{ padding: "0 24px 64px", textAlign: "center" }}>
                <p style={{ fontSize: "11px", letterSpacing: "0.12em", color: "#475569", fontWeight: 600, marginBottom: "28px", textTransform: "uppercase" }}>
                    Trusted by innovative teams worldwide
                </p>
                <motion.div
                    variants={stagger(0.08)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.5 }}
                    style={{ display: "flex", justifyContent: "center", gap: "48px", flexWrap: "wrap" }}
                >
                    {LOGOS.map(l => (
                        <motion.span key={l} variants={fadeIn} style={{ color: "#475569", fontSize: "14px", fontWeight: 700, letterSpacing: "0.04em" }}>
                            {l}
                        </motion.span>
                    ))}
                </motion.div>
            </AnimatedSection>

            {/* ── Features ── */}
            <section style={{ padding: "80px 24px", maxWidth: "1080px", margin: "0 auto" }}>
                <AnimatedSection style={{ textAlign: "center", marginBottom: "64px" }}>
                    <p style={{ fontSize: "11px", letterSpacing: "0.1em", color: "#6366f1", fontWeight: 700, textTransform: "uppercase", marginBottom: "14px" }}>
                        Designed for deep work
                    </p>
                    <h2 style={{ fontSize: "clamp(28px,4vw,44px)", fontWeight: 800, color: "white", margin: "0 0 16px", letterSpacing: "-0.02em" }}>
                        Everything you need to keep your<br />focus in the flow state.
                    </h2>
                    <p style={{ fontSize: "16px", color: "#64748b", maxWidth: "480px", margin: "0 auto", lineHeight: 1.7 }}>
                        Our editor is built with a minimalist approach, removing digital clutter so you can focus on what matters: your ideas.
                    </p>
                </AnimatedSection>

                <motion.div
                    variants={stagger(0.07)}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: false, amount: 0.1 }}
                    style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(288px,1fr))", gap: "20px" }}
                >
                    {FEATURES.map(f => (
                        <motion.div
                            key={f.title}
                            variants={cardVariant}
                            whileHover={{ y: -6, borderColor: "rgba(99,102,241,0.4)", boxShadow: "0 16px 48px rgba(0,0,0,0.45)" }}
                            style={{ background: "rgba(15,23,42,0.6)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: "14px", padding: "28px 24px", cursor: "default" }}
                        >
                            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: "18px" }}>
                                {f.icon}
                            </div>
                            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "white", margin: "0 0 10px" }}>{f.title}</h3>
                            <p style={{ fontSize: "13.5px", color: "#64748b", lineHeight: 1.7, margin: 0 }}>{f.desc}</p>
                        </motion.div>
                    ))}
                </motion.div>
            </section>

            {/* ── CTA banner ── */}
            <section style={{ padding: "40px 24px 100px" }}>
                <AnimatedSection style={{ maxWidth: "860px", margin: "0 auto" }} amount={0.3}>
                    <motion.div
                        whileHover={{ boxShadow: "0 32px 80px rgba(99,102,241,0.2)" }}
                        transition={{ duration: 0.3 }}
                        style={{
                            background: "linear-gradient(135deg,rgba(30,41,80,0.9),rgba(20,15,40,0.95))",
                            border: "1px solid rgba(99,102,241,0.3)",
                            borderRadius: "20px", padding: "64px 40px",
                            textAlign: "center", position: "relative", overflow: "hidden",
                        }}
                    >
                        {/* bg glow */}
                        <div style={{ position: "absolute", top: "-50%", left: "50%", transform: "translateX(-50%)", width: "500px", height: "300px", background: "radial-gradient(ellipse,rgba(99,102,241,0.2) 0%,transparent 65%)", pointerEvents: "none" }} />

                        <motion.h2
                            initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                            style={{ fontSize: "clamp(26px,4vw,42px)", fontWeight: 800, color: "white", margin: "0 0 14px", letterSpacing: "-0.02em", position: "relative" }}
                        >Ready to flow?</motion.h2>

                        <motion.p
                            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.15 }}
                            style={{ fontSize: "16px", color: "#94a3b8", margin: "0 0 36px", lineHeight: 1.6, position: "relative" }}
                        >
                            Join over 10,000 creators, engineers, and strategists who use MindFlow to<br />
                            turn chaotic thoughts into structured plans.
                        </motion.p>

                        <motion.div
                            initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: 0.25 }}
                            style={{ display: "flex", gap: "14px", justifyContent: "center", flexWrap: "wrap", position: "relative" }}
                        >
                            <motion.button
                                onClick={() => navigate(dest)}
                                whileHover={{ scale: 1.04, y: -2, boxShadow: "0 0 32px rgba(59,130,246,0.5)" }}
                                whileTap={{ scale: 0.97 }}
                                style={{ background: "#3b82f6", border: "none", color: "white", fontSize: "14px", fontWeight: 600, cursor: "pointer", padding: "13px 26px", borderRadius: "9px", boxShadow: "0 0 20px rgba(59,130,246,0.35)" }}
                            >Start Mapping for Free</motion.button>
                            <motion.button
                                whileHover={{ scale: 1.03, background: "rgba(255,255,255,0.12)" }}
                                whileTap={{ scale: 0.97 }}
                                style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.15)", color: "#e2e8f0", fontSize: "14px", fontWeight: 500, cursor: "pointer", padding: "13px 24px", borderRadius: "9px" }}
                            >View Pricing</motion.button>
                        </motion.div>

                        <p style={{ fontSize: "12px", color: "#475569", marginTop: "18px", position: "relative" }}>
                            No credit card required · Free forever plan available
                        </p>
                    </motion.div>
                </AnimatedSection>
            </section>

            {/* ── Footer ── */}
            <footer style={{ borderTop: "1px solid rgba(255,255,255,0.06)", padding: "48px 40px 32px", maxWidth: "1080px", margin: "0 auto" }}>
                <AnimatedSection>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: "40px", flexWrap: "wrap", marginBottom: "48px" }}>
                        {/* Brand */}
                        <div style={{ maxWidth: "220px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                                <div style={{ width: "28px", height: "28px", background: "linear-gradient(135deg,#3b82f6,#6366f1)", borderRadius: "7px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                                        <circle cx="12" cy="5" r="3" fill="white" />
                                        <circle cx="5" cy="19" r="3" fill="white" />
                                        <circle cx="19" cy="19" r="3" fill="white" />
                                        <line x1="12" y1="8" x2="5" y2="16" stroke="white" strokeWidth="2" />
                                        <line x1="12" y1="8" x2="19" y2="16" stroke="white" strokeWidth="2" />
                                    </svg>
                                </div>
                                <span style={{ fontWeight: 700, fontSize: "15px", color: "white" }}>MindFlow</span>
                            </div>
                            <p style={{ fontSize: "13px", color: "#475569", lineHeight: 1.7, margin: 0 }}>
                                The infinite workspace for your best ideas. Built for creativity by creators.
                            </p>
                        </div>

                        {/* Link columns */}
                        {[
                            { heading: "Product", links: ["Features", "Pricing", "Changelog", "Roadmap"] },
                            { heading: "Company", links: ["About", "Blog", "Careers", "Contact"] },
                            { heading: "Legal", links: ["Privacy", "Terms", "Security"] },
                        ].map(col => (
                            <div key={col.heading}>
                                <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#6b7280", textTransform: "uppercase", letterSpacing: "0.08em", margin: "0 0 16px" }}>
                                    {col.heading}
                                </h4>
                                {col.links.map(l => (
                                    <div key={l} style={{ marginBottom: "10px" }}>
                                        <motion.a href="#" whileHover={{ color: "#e2e8f0" }} style={{ fontSize: "13.5px", color: "#64748b", textDecoration: "none" }}>
                                            {l}
                                        </motion.a>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    <div style={{ paddingTop: "24px", borderTop: "1px solid rgba(255,255,255,0.05)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px" }}>
                        <p style={{ fontSize: "12px", color: "#374151", margin: 0 }}>© 2024 MindFlow Inc. All rights reserved.</p>
                        <div style={{ display: "flex", gap: "16px" }}>
                            {["twitter", "github", "mail"].map(icon => (
                                <motion.a key={icon} href="#" whileHover={{ color: "#94a3b8", scale: 1.15 }} style={{ color: "#374151" }}>
                                    <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        {icon === "twitter" && <path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z" />}
                                        {icon === "github" && <><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22" /></>}
                                        {icon === "mail" && <><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></>}
                                    </svg>
                                </motion.a>
                            ))}
                        </div>
                    </div>
                </AnimatedSection>
            </footer>
        </div>
    );
}
