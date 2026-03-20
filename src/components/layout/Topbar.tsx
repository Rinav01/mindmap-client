import { useAuthStore } from "../../store/authStore";
import { useNavigate } from "react-router-dom";

interface TopBarProps {
  activeTab?: "projects" | "templates";
  onTabChange?: (tab: "projects" | "templates") => void;
}

export default function TopBar({ activeTab = "projects", onTabChange }: TopBarProps) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  return (
    <div style={{
      display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px",
      padding: "12px 24px", background: "#101419",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      fontFamily: "Inter, sans-serif",
    }}>
      {/* Left side: Logo & Nav Links */}
      <div style={{ display: "flex", alignItems: "center", gap: "32px", height: "40px" }}>
        
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "32px", height: "32px", background: "linear-gradient(135deg, #c0c1ff, #8083ff)",
            borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
          }}>
            <svg width="18" height="18" fill="#1a1a3a" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </div>
          <span style={{ color: "#e0e2ea", fontWeight: 700, fontSize: "16px", letterSpacing: "-0.3px", fontFamily: "Manrope, sans-serif" }}>CognitiveSlate</span>
        </div>

        {/* Top Nav Links */}
        <nav style={{ display: "flex", alignItems: "center", gap: "24px", height: "100%" }}>
          <button 
            onClick={() => onTabChange?.("projects")}
            style={{ 
              background: "none", border: "none", borderBottom: activeTab === "projects" ? "2px solid #c0c1ff" : "2px solid transparent",
              color: activeTab === "projects" ? "#e0e2ea" : "#9ca3af", 
              fontSize: "14px", fontWeight: activeTab === "projects" ? 600 : 500, 
              padding: "10px 0", cursor: "pointer", transition: "color 0.15s, border-color 0.15s", fontFamily: "Inter, sans-serif" 
            }} 
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#e0e2ea"; }} 
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = activeTab === "projects" ? "#e0e2ea" : "#9ca3af"; }}
          >
            Projects
          </button>
          
          <button 
            style={{ 
              background: "none", border: "none", borderBottom: "2px solid transparent",
              color: "#9ca3af", fontSize: "14px", fontWeight: 500, 
              padding: "10px 0", cursor: "default", transition: "color 0.15s", fontFamily: "Inter, sans-serif" 
            }} 
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#e0e2ea"; }} 
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}
          >
            Canvas
          </button>

          <button 
            onClick={() => onTabChange?.("templates")}
            style={{ 
              background: "none", border: "none", borderBottom: activeTab === "templates" ? "2px solid #c0c1ff" : "2px solid transparent",
              color: activeTab === "templates" ? "#e0e2ea" : "#9ca3af", 
              fontSize: "14px", fontWeight: activeTab === "templates" ? 600 : 500, 
              padding: "10px 0", cursor: "pointer", transition: "color 0.15s, border-color 0.15s", fontFamily: "Inter, sans-serif" 
            }} 
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#e0e2ea"; }} 
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = activeTab === "templates" ? "#e0e2ea" : "#9ca3af"; }}
          >
            Templates
          </button>

          <button 
            style={{ 
              background: "none", border: "none", borderBottom: "2px solid transparent",
              color: "#9ca3af", fontSize: "14px", fontWeight: 500, 
              padding: "10px 0", cursor: "default", transition: "color 0.15s", fontFamily: "Inter, sans-serif" 
            }} 
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#e0e2ea"; }} 
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}
          >
            Library
          </button>
        </nav>
      </div>

      {/* Right Side: Search, Bell, Settings, Avatar */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Search */}
        <div style={{ position: "relative", width: "240px" }}>
          <span style={{ position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)", color: "#6b7280", pointerEvents: "none" }}>
            <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </span>
          <input
            placeholder="Search ideas..."
            style={{
              width: "100%", padding: "8px 14px 8px 40px",
              background: "#1c2025", border: "none", borderBottom: "2px solid transparent",
              borderRadius: "8px", color: "#e0e2ea", fontSize: "13px",
              outline: "none", fontFamily: "Inter, sans-serif",
              transition: "border-color 0.15s, box-shadow 0.15s",
            }}
            onFocus={(e) => { 
              e.currentTarget.style.borderBottomColor = "#c0c1ff";
              e.currentTarget.style.boxShadow = "0 8px 15px -5px rgba(192, 193, 255, 0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderBottomColor = "transparent";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
        </div>

        {/* Bell */}
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "6px", display: "flex", alignItems: "center", transition: "color 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#e0e2ea"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; }}>
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2zm-2 1H8v-6c0-2.48 1.51-4.5 4-4.5s4 2.02 4 4.5v6z" />
          </svg>
        </button>

        {/* Settings */}
        <button style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", padding: "6px", display: "flex", alignItems: "center", transition: "color 0.15s" }} onMouseEnter={(e) => { e.currentTarget.style.color = "#e0e2ea"; }} onMouseLeave={(e) => { e.currentTarget.style.color = "#9ca3af"; }}>
          <svg width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
            <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.06-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.73 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.06.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.49-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z" />
          </svg>
        </button>

        {/* Avatar */}
        <div
          onClick={() => {
            if (window.confirm("Do you want to logout?")) {
              logout();
              navigate("/login");
            }
          }}
          title={user?.name || "User"}
          style={{
            width: "28px", height: "28px", borderRadius: "50%",
            background: "#f59e0b", color: "#1a1a3a", fontSize: "12px", fontWeight: 700,
            display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", marginLeft: "4px"
          }}
        >
          {user?.name?.charAt(0)?.toUpperCase() || 'U'}
        </div>
      </div>
    </div>
  );
}
