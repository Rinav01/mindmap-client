import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../services/authService";

export default function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [agreedToTerms, setAgreedToTerms] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            await authService.register({ username, email, password });
            navigate("/login", { state: { message: "Account created successfully. Please sign in." } });
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to register");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0a0a0b", color: "#fff", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", fontFamily: "Inter, system-ui, sans-serif" }}>

            {/* Dot grid overlay */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(29,78,216,0.14) 1px, transparent 0)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

            <style>{`
              @keyframes nodeGlowR {
                0%, 100% { opacity: 0.3; transform: scale(1); }
                50%       { opacity: 0.9; transform: scale(1.6); }
              }
              @keyframes lineFadeR {
                0%, 100% { stroke-opacity: 0.15; }
                50%       { stroke-opacity: 0.65; }
              }
              .rg-node { animation: nodeGlowR 5.5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
              .rg-line  { animation: lineFadeR 7s  ease-in-out infinite; }
            `}</style>

            {/* Connecting lines SVG */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
                <line className="rg-line" stroke="#1d4ed8" strokeWidth="0.8" x1="8%" y1="18%" x2="25%" y2="42%" style={{ animationDelay: "0s" }} />
                <circle className="rg-node" cx="8%" cy="18%" fill="#1d4ed8" r="3" style={{ animationDelay: "0s" }} />
                <circle className="rg-node" cx="25%" cy="42%" fill="#1d4ed8" r="4" style={{ animationDelay: "1.4s" }} />
                <line className="rg-line" stroke="#1d4ed8" strokeWidth="0.8" x1="25%" y1="42%" x2="14%" y2="72%" style={{ animationDelay: "1.8s" }} />
                <circle className="rg-node" cx="14%" cy="72%" fill="#1d4ed8" r="2.5" style={{ animationDelay: "2.8s" }} />
                <line className="rg-line" stroke="#1d4ed8" strokeWidth="0.8" x1="80%" y1="10%" x2="60%" y2="28%" style={{ animationDelay: "0.6s" }} />
                <circle className="rg-node" cx="80%" cy="10%" fill="#1d4ed8" r="2.5" style={{ animationDelay: "0.3s" }} />
                <circle className="rg-node" cx="60%" cy="28%" fill="#1d4ed8" r="2" style={{ animationDelay: "2.1s" }} />
                <line className="rg-line" stroke="#1d4ed8" strokeWidth="0.8" x1="88%" y1="62%" x2="70%" y2="48%" style={{ animationDelay: "2.4s" }} />
                <circle className="rg-node" cx="88%" cy="62%" fill="#1d4ed8" r="3" style={{ animationDelay: "3.4s" }} />
                <circle className="rg-node" cx="70%" cy="48%" fill="#1d4ed8" r="2" style={{ animationDelay: "1s" }} />
                <line className="rg-line" stroke="#1d4ed8" strokeWidth="0.8" x1="12%" y1="87%" x2="30%" y2="74%" style={{ animationDelay: "3s" }} />
                <circle className="rg-node" cx="12%" cy="87%" fill="#1d4ed8" r="2.5" style={{ animationDelay: "4s" }} />
                <circle className="rg-node" cx="30%" cy="74%" fill="#1d4ed8" r="3.5" style={{ animationDelay: "0.9s" }} />
                <line className="rg-line" stroke="#1d4ed8" strokeWidth="0.8" x1="84%" y1="82%" x2="68%" y2="70%" style={{ animationDelay: "1.6s" }} />
                <circle className="rg-node" cx="84%" cy="82%" fill="#1d4ed8" r="2.5" style={{ animationDelay: "2.6s" }} />
                <circle className="rg-node" cx="68%" cy="70%" fill="#1d4ed8" r="2" style={{ animationDelay: "3.7s" }} />
            </svg>

            {/* Header */}
            <header style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", maxWidth: "1200px", width: "100%", margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(59,130,246,0.4)" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
                    </div>
                    <span style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.02em" }}>MindMap <span style={{ color: "#60a5fa" }}>Pro</span></span>
                </div>
                <nav style={{ display: "flex", alignItems: "center", gap: "32px", fontSize: "14px", color: "#94a3b8" }}>
                    <span style={{ cursor: "pointer" }}>Product</span>
                    <span style={{ cursor: "pointer" }}>Templates</span>
                    <span style={{ cursor: "pointer" }}>Pricing</span>
                    <Link to="/login" style={{ border: "1px solid rgba(255,255,255,0.2)", color: "#fff", padding: "8px 20px", borderRadius: "8px", fontWeight: 500, textDecoration: "none", transition: "border-color 0.2s" }}>
                        Sign In
                    </Link>
                </nav>
            </header>

            {/* Main */}
            <main style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>

                {/* Card */}
                <div style={{ width: "100%", maxWidth: "480px", backgroundColor: "#111827", border: "1px solid #1e2a3a", borderRadius: "20px", boxShadow: "0 25px 60px rgba(0,0,0,0.7)", padding: "48px 40px" }}>

                    <h1 style={{ fontSize: "30px", fontWeight: 700, textAlign: "center", letterSpacing: "-0.02em", marginBottom: "8px" }}>Get Started</h1>
                    <p style={{ color: "#94a3b8", textAlign: "center", fontSize: "15px", marginBottom: "32px", lineHeight: 1.6, maxWidth: "280px", margin: "0 auto 32px" }}>
                        Join 10,000+ creators mapping their vision on an infinite canvas.
                    </p>

                    {error && (
                        <div style={{ marginBottom: "20px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px", color: "#f87171", fontSize: "14px", textAlign: "center" }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                        {/* Full Name */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ fontSize: "14px", fontWeight: 500, color: "#cbd5e1" }}>Full Name</label>
                            <div style={{ display: "flex", alignItems: "center", height: "48px", backgroundColor: "#1a2235", border: "1px solid #253044", borderRadius: "12px", padding: "0 16px", gap: "12px" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7a99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                                <input type="text" placeholder="John Doe" value={username} onChange={(e) => setUsername(e.target.value)} required
                                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "14px", width: "100%" }}
                                />
                            </div>
                        </div>

                        {/* Email */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ fontSize: "14px", fontWeight: 500, color: "#cbd5e1" }}>Email Address</label>
                            <div style={{ display: "flex", alignItems: "center", height: "48px", backgroundColor: "#1a2235", border: "1px solid #253044", borderRadius: "12px", padding: "0 16px", gap: "12px" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7a99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                <input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "14px", width: "100%" }}
                                />
                            </div>
                        </div>

                        {/* Create Password */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ fontSize: "14px", fontWeight: 500, color: "#cbd5e1" }}>Create Password</label>
                            <div style={{ display: "flex", alignItems: "center", height: "48px", backgroundColor: "#1a2235", border: "1px solid #253044", borderRadius: "12px", padding: "0 16px", gap: "12px" }}>
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7a99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                <input type={showPassword ? "text" : "password"} placeholder="Min. 8 characters" value={password} onChange={(e) => setPassword(e.target.value)} required
                                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "14px", width: "100%" }}
                                />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7a99", display: "flex", alignItems: "center", flexShrink: 0 }}>
                                    {showPassword
                                        ? <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" /></svg>
                                        : <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" /><circle cx="12" cy="12" r="3" /></svg>
                                    }
                                </button>
                            </div>
                        </div>

                        {/* Terms */}
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                            <input id="terms" type="checkbox" checked={agreedToTerms} onChange={(e) => setAgreedToTerms(e.target.checked)} required
                                style={{ width: "16px", height: "16px", accentColor: "#3b82f6", cursor: "pointer", flexShrink: 0, marginTop: "2px" }}
                            />
                            <label htmlFor="terms" style={{ fontSize: "13px", color: "#94a3b8", cursor: "pointer", lineHeight: 1.6 }}>
                                By signing up, you agree to our{" "}
                                <span style={{ color: "#60a5fa", cursor: "pointer" }}>Terms of Service</span>{" "}
                                and{" "}
                                <span style={{ color: "#60a5fa", cursor: "pointer" }}>Privacy Policy</span>.
                            </label>
                        </div>

                        {/* Create Account button */}
                        <button type="submit" disabled={loading}
                            style={{ width: "100%", height: "48px", borderRadius: "12px", backgroundColor: "#3b82f6", color: "#fff", fontWeight: 600, fontSize: "15px", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 8px 24px rgba(59,130,246,0.35)", transition: "background 0.2s", marginTop: "4px" }}
                        >
                            <span>{loading ? "Creating Account..." : "Create Account"}</span>
                            {!loading && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>}
                        </button>
                    </form>

                    {/* Already have an account */}
                    <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid #1e2a3a", textAlign: "center" }}>
                        <p style={{ color: "#94a3b8", fontSize: "14px" }}>
                            Already have an account?{" "}
                            <Link to="/login" style={{ color: "#60a5fa", fontWeight: 500, textDecoration: "none" }}>Sign in here</Link>
                        </p>
                    </div>
                </div>

                {/* Trusted by */}
                <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", alignItems: "center", gap: "16px" }}>
                    <p style={{ fontSize: "11px", color: "#475569", textTransform: "uppercase", letterSpacing: "0.2em", fontWeight: 600 }}>Trusted by teams at</p>
                    <div style={{ display: "flex", alignItems: "center", gap: "32px", opacity: 0.4, filter: "grayscale(1)" }}>
                        <div style={{ height: "20px", width: "72px", backgroundColor: "#475569", borderRadius: "4px", clipPath: "polygon(0% 20%, 100% 20%, 100% 80%, 0% 80%)" }} />
                        <div style={{ height: "20px", width: "88px", backgroundColor: "#475569", borderRadius: "4px", clipPath: "polygon(8% 0%, 92% 0%, 100% 100%, 0% 100%)" }} />
                        <div style={{ height: "20px", width: "52px", backgroundColor: "#475569", borderRadius: "50%", clipPath: "circle(38% at 50% 50%)" }} />
                    </div>
                </div>
            </main>

            {/* Footer */}
            <footer style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", maxWidth: "1200px", width: "100%", margin: "0 auto", borderTop: "1px solid #111", fontSize: "12px", color: "#4b5563" }}>
                <div style={{ display: "flex", gap: "24px" }}>
                    <span>© 2024 MindMap SaaS Inc.</span>
                    <span style={{ cursor: "pointer" }}>Help Center</span>
                    <span style={{ cursor: "pointer" }}>Status</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", backgroundColor: "#10b981", boxShadow: "0 0 8px rgba(16,185,129,0.8)", display: "inline-block" }} />
                    <span>System Operational</span>
                </div>
            </footer>
        </div>
    );
}
