import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import { authService } from "../../services/authService";

export default function LoginPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const login = useAuthStore((state) => state.login);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [rememberDevice, setRememberDevice] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (location.state?.message) {
            setSuccessMessage(location.state.message);
        }
    }, [location.state]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const { token, user } = await authService.login({ email: email.trim(), password: password.trim() });
            login(token, user);
            navigate("/dashboard");
        } catch (err: any) {
            setError(err.response?.data?.message || "Invalid credentials.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: "100vh", backgroundColor: "#0d1117", color: "#fff", display: "flex", flexDirection: "column", overflow: "hidden", position: "relative", fontFamily: "Inter, system-ui, sans-serif" }}>

            <style>{`
              @keyframes nodeGlow {
                0%, 100% { opacity: 0.35; transform: scale(1); }
                50%       { opacity: 1;    transform: scale(1.55); }
              }
              @keyframes lineFade {
                0%, 100% { stroke-opacity: 0.2; }
                50%       { stroke-opacity: 0.75; }
              }
              .bg-node { animation: nodeGlow 5s ease-in-out infinite; transform-box: fill-box; transform-origin: center; }
              .bg-line  { animation: lineFade 6s ease-in-out infinite; }

              .social-btn {
                display: flex;
                align-items: center;
                justify-content: center;
                gap: 10px;
                height: 44px;
                border-radius: 10px;
                border: 1px solid #21293a;
                background-color: #1c2333;
                color: #fff;
                font-size: 14px;
                font-weight: 500;
                cursor: pointer;
                transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.15s ease, box-shadow 0.2s ease;
              }
              .social-btn:hover {
                background-color: #1e2e4a;
                border-color: #3b82f6;
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(59, 130, 246, 0.2);
              }
              .social-btn:active {
                transform: translateY(0px);
                box-shadow: none;
              }
            `}</style>

            {/* Dot grid overlay */}
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle at 1px 1px, rgba(56,139,253,0.10) 1px, transparent 0)", backgroundSize: "40px 40px", pointerEvents: "none" }} />

            {/* Connecting lines SVG */}
            <svg style={{ position: "absolute", inset: 0, width: "100%", height: "100%", pointerEvents: "none" }} xmlns="http://www.w3.org/2000/svg">
                <line className="bg-line" stroke="#3b82f6" strokeWidth="0.8" x1="5%" y1="30%" x2="35%" y2="55%" style={{ animationDelay: "0s" }} />
                <circle className="bg-node" cx="5%" cy="30%" fill="#3b82f6" r="3" style={{ animationDelay: "0s" }} />
                <circle className="bg-node" cx="35%" cy="55%" fill="#3b82f6" r="4" style={{ animationDelay: "1.2s" }} />
                <line className="bg-line" stroke="#3b82f6" strokeWidth="0.8" x1="35%" y1="55%" x2="20%" y2="80%" style={{ animationDelay: "1.5s" }} />
                <circle className="bg-node" cx="20%" cy="80%" fill="#3b82f6" r="2.5" style={{ animationDelay: "2.4s" }} />
                <line className="bg-line" stroke="#3b82f6" strokeWidth="0.8" x1="75%" y1="15%" x2="50%" y2="38%" style={{ animationDelay: "0.8s" }} />
                <circle className="bg-node" cx="75%" cy="15%" fill="#3b82f6" r="2.5" style={{ animationDelay: "0.4s" }} />
                <line className="bg-line" stroke="#3b82f6" strokeWidth="0.8" x1="90%" y1="60%" x2="68%" y2="45%" style={{ animationDelay: "2s" }} />
                <circle className="bg-node" cx="90%" cy="60%" fill="#3b82f6" r="3" style={{ animationDelay: "3s" }} />
                <circle className="bg-node" cx="68%" cy="45%" fill="#3b82f6" r="2" style={{ animationDelay: "1.8s" }} />
            </svg>

            {/* Header */}
            <header style={{ position: "relative", zIndex: 10, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", maxWidth: "1200px", width: "100%", margin: "0 auto" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{ width: "36px", height: "36px", borderRadius: "10px", backgroundColor: "#3b82f6", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 20px rgba(59,130,246,0.4)" }}>
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M8 3H5a2 2 0 0 0-2 2v3" /><path d="M21 8V5a2 2 0 0 0-2-2h-3" /><path d="M3 16v3a2 2 0 0 0 2 2h3" /><path d="M16 21h3a2 2 0 0 0 2-2v-3" /></svg>
                    </div>
                    <span style={{ fontSize: "18px", fontWeight: 600, letterSpacing: "-0.02em" }}>MindFlow</span>
                </div>
                <nav style={{ display: "flex", alignItems: "center", gap: "32px", fontSize: "14px", color: "#94a3b8" }}>
                    <span style={{ cursor: "pointer", transition: "color 0.2s" }}>Pricing</span>
                    <span style={{ cursor: "pointer", transition: "color 0.2s" }}>Resources</span>
                    <Link to="/register" style={{ backgroundColor: "#3b82f6", color: "#fff", padding: "8px 20px", borderRadius: "8px", fontWeight: 500, textDecoration: "none", boxShadow: "0 4px 14px rgba(59,130,246,0.35)", transition: "background 0.2s" }}>
                        Get Started
                    </Link>
                </nav>
            </header>

            {/* Main */}
            <main style={{ position: "relative", zIndex: 10, flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "32px 16px" }}>

                {/* Card */}
                <div style={{ width: "100%", maxWidth: "480px", backgroundColor: "#161b27", border: "1px solid #21293a", borderRadius: "20px", boxShadow: "0 25px 60px rgba(0,0,0,0.6)", padding: "48px 40px" }}>

                    {/* Card header */}
                    <h1 style={{ fontSize: "30px", fontWeight: 700, textAlign: "center", letterSpacing: "-0.02em", marginBottom: "8px" }}>Welcome Back</h1>
                    <p style={{ color: "#94a3b8", textAlign: "center", fontSize: "15px", marginBottom: "32px" }}>Enter your details to access your workspace</p>

                    {successMessage && (
                        <div style={{ marginBottom: "20px", backgroundColor: "rgba(16,185,129,0.1)", border: "1px solid rgba(16,185,129,0.2)", borderRadius: "10px", padding: "12px", color: "#34d399", fontSize: "14px", textAlign: "center" }}>
                            {successMessage}
                        </div>
                    )}
                    {error && (
                        <div style={{ marginBottom: "20px", backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", borderRadius: "10px", padding: "12px", color: "#f87171", fontSize: "14px", textAlign: "center" }}>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

                        {/* Email */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <label style={{ fontSize: "14px", fontWeight: 500, color: "#cbd5e1" }}>Email Address</label>
                            <div style={{ display: "flex", alignItems: "center", height: "48px", backgroundColor: "#1c2333", border: "1px solid #2a3347", borderRadius: "12px", padding: "0 16px", gap: "12px", transition: "border-color 0.2s" }}
                                onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
                                onBlur={(e) => (e.currentTarget.style.borderColor = "#2a3347")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7a99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect width="20" height="16" x="2" y="4" rx="2" /><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" /></svg>
                                <input type="email" placeholder="name@company.com" value={email} onChange={(e) => setEmail(e.target.value)} required
                                    style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: "14px", width: "100%" }}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                <label style={{ fontSize: "14px", fontWeight: 500, color: "#cbd5e1" }}>Password</label>
                                <span style={{ fontSize: "13px", color: "#60a5fa", cursor: "pointer" }}>Forgot password?</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", height: "48px", backgroundColor: "#1c2333", border: "1px solid #2a3347", borderRadius: "12px", padding: "0 16px", gap: "12px", transition: "border-color 0.2s" }}
                                onFocus={(e) => (e.currentTarget.style.borderColor = "#3b82f6")}
                                onBlur={(e) => (e.currentTarget.style.borderColor = "#2a3347")}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7a99" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><rect width="18" height="11" x="3" y="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                                <input type={showPassword ? "text" : "password"} placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required
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

                        {/* Remember device */}
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <input id="remember" type="checkbox" checked={rememberDevice} onChange={(e) => setRememberDevice(e.target.checked)}
                                style={{ width: "16px", height: "16px", accentColor: "#3b82f6", cursor: "pointer", flexShrink: 0 }}
                            />
                            <label htmlFor="remember" style={{ fontSize: "14px", color: "#94a3b8", cursor: "pointer" }}>Remember this device</label>
                        </div>

                        {/* Sign In button */}
                        <button type="submit" disabled={loading}
                            style={{ width: "100%", height: "48px", borderRadius: "12px", backgroundColor: "#3b82f6", color: "#fff", fontWeight: 600, fontSize: "15px", border: "none", cursor: loading ? "not-allowed" : "pointer", opacity: loading ? 0.6 : 1, display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", boxShadow: "0 8px 24px rgba(59,130,246,0.35)", transition: "background 0.2s, box-shadow 0.2s", marginTop: "4px" }}
                        >
                            <span>{loading ? "Signing In..." : "Sign In"}</span>
                            {!loading && <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>}
                        </button>

                        {/* Divider */}
                        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                            <div style={{ flex: 1, height: "1px", backgroundColor: "#21293a" }} />
                            <span style={{ fontSize: "13px", color: "#64748b", whiteSpace: "nowrap" }}>Or continue with</span>
                            <div style={{ flex: 1, height: "1px", backgroundColor: "#21293a" }} />
                        </div>

                        {/* Social buttons */}
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                            <button type="button" className="social-btn">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" /><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" /><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" /><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" /></svg>
                                Google
                            </button>
                            <button type="button" className="social-btn">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" /><path d="M9 18c-4.51 2-5-2-7-2" /></svg>
                                Github
                            </button>
                        </div>
                    </form>
                </div>

                {/* Below card */}
                <p style={{ marginTop: "24px", color: "#94a3b8", fontSize: "14px" }}>
                    Don't have an account?{" "}
                    <Link to="/register" style={{ color: "#60a5fa", fontWeight: 500, textDecoration: "none" }}>Create an account</Link>
                </p>
            </main>

            {/* Footer */}
            <footer style={{ position: "relative", zIndex: 10, textAlign: "center", padding: "20px", fontSize: "11px", color: "#334155", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                © 2024 MINDFLOW SYSTEMS. SECURE ENTERPRISE ACCESS.
            </footer>
        </div>
    );
}