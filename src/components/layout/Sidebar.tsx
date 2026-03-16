import { useNavigate, useLocation } from "react-router-dom";

const navItems = [
  {
    label: "Recent",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
      </svg>
    ),
    path: "/dashboard",
  },
  {
    label: "Starred",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    ),
    path: "/starred",
  },
  {
    label: "All Maps",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
    path: "/all",
  },
  {
    label: "Trash",
    icon: (
      <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
        <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
      </svg>
    ),
    path: "/trash",
  },
];

const folders = [
  { label: "Marketing strategy", color: "#f59e0b" },
  { label: "Product Roadmap", color: "#3b82f6" },
  { label: "Brainstorming", color: "#a855f7" },
];

import { useAuthStore } from "../../store/authStore";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuthStore();

  return (
    <div
      style={{
        width: "210px",
        minWidth: "210px",
        background: "#111827",
        borderRight: "1px solid #1f2937",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "0",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Logo */}
      <div style={{ padding: "20px 16px 16px", display: "flex", alignItems: "center", gap: "10px" }}>
        <div style={{
          width: "32px", height: "32px", background: "linear-gradient(135deg, #3b82f6, #2563eb)",
          borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          <svg width="18" height="18" fill="white" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
          </svg>
        </div>
        <span style={{ color: "white", fontWeight: 700, fontSize: "16px", letterSpacing: "-0.3px" }}>MindFlow</span>
      </div>

      {/* Nav */}
      <nav style={{ padding: "4px 8px", flex: "0 0 auto" }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                width: "100%", padding: "9px 10px", borderRadius: "8px",
                border: "none", cursor: "pointer", textAlign: "left",
                background: isActive ? "#1d4ed8" : "transparent",
                color: isActive ? "white" : "#9ca3af",
                fontSize: "14px", fontWeight: isActive ? 600 : 400,
                transition: "background 0.15s, color 0.15s",
                marginBottom: "2px",
              }}
              onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; (e.currentTarget as HTMLButtonElement).style.color = "white"; } }}
              onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; } }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Folders */}
      <div style={{ padding: "16px 8px 8px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 10px 8px" }}>
          <span style={{ color: "#6b7280", fontSize: "11px", fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase" }}>Folders</span>
          <button style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "18px", lineHeight: 1, padding: "0 2px" }}>+</button>
        </div>
        {folders.map((f) => (
          <button
            key={f.label}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              width: "100%", padding: "8px 10px", borderRadius: "8px",
              border: "none", cursor: "pointer", textAlign: "left",
              background: "transparent", color: "#9ca3af", fontSize: "13px",
              transition: "background 0.15s, color 0.15s", marginBottom: "2px",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1f2937"; (e.currentTarget as HTMLButtonElement).style.color = "white"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}
          >
            <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: f.color, flexShrink: 0, display: "inline-block" }} />
            {f.label}
          </button>
        ))}
      </div>

      {/* User */}
      <div style={{
        padding: "12px 16px", borderTop: "1px solid #1f2937",
        display: "flex", alignItems: "center", gap: "10px",
      }}>
        <div style={{
          width: "34px", height: "34px", borderRadius: "50%",
          background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
          display: "flex", alignItems: "center", justifyContent: "center",
          color: "white", fontSize: "13px", fontWeight: 700, flexShrink: 0,
        }}>{user?.name?.charAt(0)?.toUpperCase() || 'U'}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: "white", fontSize: "13px", fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{user?.name || "User"}</div>
          <div style={{ color: "#6b7280", fontSize: "11px" }}>{user?.email || "Pro Account"}</div>
        </div>
        <button
          onClick={() => {
            logout();
            navigate("/login");
          }}
          title="Logout"
          style={{ background: "none", border: "none", cursor: "pointer", color: "#6b7280", padding: "2px", transition: "color 0.15s" }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#6b7280"; }}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
