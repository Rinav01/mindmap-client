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
  const { logout } = useAuthStore();

  return (
    <div
      style={{
        width: "240px",
        minWidth: "240px",
        background: "#12141a",
        borderRight: "none",
        boxShadow: "4px 0 20px rgba(0,0,0,0.15)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        padding: "0",
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* Workspace Logo */}
      <div style={{ padding: "32px 20px", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <img src="/vite.svg" alt="Vite Logo" style={{ height: "64px", width: "auto" }} />
      </div>

      {/* Nav */}
      <div style={{ padding: "0 20px 16px", fontSize: "10px", fontWeight: 700, color: "#6b7280", letterSpacing: "0.05em", textTransform: "uppercase" }}>
        Navigation
      </div>
      <nav style={{ padding: "0 12px", flex: "0 0 auto", display: "flex", flexDirection: "column", gap: "2px" }}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <button
              key={item.label}
              onClick={() => navigate(item.path)}
              style={{
                display: "flex", alignItems: "center", gap: "10px",
                width: "100%", padding: "10px 12px", borderRadius: "8px",
                border: "none", cursor: "pointer", textAlign: "left",
                background: isActive ? "#21262d" : "transparent",
                color: isActive ? "#e0e2ea" : "#9ca3af",
                fontSize: "13px", fontWeight: isActive ? 600 : 500,
                transition: "background 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = "#1c2025"; (e.currentTarget as HTMLButtonElement).style.color = "#e0e2ea"; } }}
              onMouseLeave={(e) => { if (!isActive) { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; } }}
            >
              {item.icon}
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Folders */}
      <div style={{ padding: "24px 12px 8px", flex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 8px 12px" }}>
          <span style={{ color: "#6b7280", fontSize: "10px", fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>Folders</span>
          <button style={{ background: "none", border: "none", color: "#6b7280", cursor: "pointer", fontSize: "16px", lineHeight: 1, padding: "0" }}>+</button>
        </div>
        {folders.map((f) => (
          <button
            key={f.label}
            style={{
              display: "flex", alignItems: "center", gap: "10px",
              width: "100%", padding: "8px 12px", borderRadius: "8px",
              border: "none", cursor: "pointer", textAlign: "left",
              background: "transparent", color: "#9ca3af", fontSize: "13px", fontWeight: 500,
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1c2025"; (e.currentTarget as HTMLButtonElement).style.color = "#e0e2ea"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "transparent"; (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; }}
          >
            <span style={{ width: "12px", height: "12px", borderRadius: "3px", background: f.color, flexShrink: 0, display: "inline-block" }} />
            {f.label}
          </button>
        ))}
      </div>

      {/* Bottom Actions */}
      <div style={{
        padding: "16px 12px 24px", borderTop: "none",
        display: "flex", flexDirection: "column", gap: "4px",
      }}>
        <button
          onClick={() => {}}
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            width: "100%", padding: "10px 12px", borderRadius: "8px",
            background: "none", border: "none", cursor: "pointer", textAlign: "left",
            color: "#9ca3af", fontSize: "13px", fontWeight: 500,
            transition: "color 0.15s, background 0.15s"
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#e0e2ea"; (e.currentTarget as HTMLButtonElement).style.background = "#1c2025"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
          Help
        </button>

        <button
          onClick={() => {
            if (window.confirm("Do you want to logout?")) {
              logout();
              navigate("/login");
            }
          }}
          style={{
            display: "flex", alignItems: "center", gap: "12px",
            width: "100%", padding: "10px 12px", borderRadius: "8px",
            background: "none", border: "none", cursor: "pointer", textAlign: "left",
            color: "#9ca3af", fontSize: "13px", fontWeight: 500,
            transition: "color 0.15s, background 0.15s"
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#ef4444"; (e.currentTarget as HTMLButtonElement).style.background = "rgba(239,68,68,0.1)"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.color = "#9ca3af"; (e.currentTarget as HTMLButtonElement).style.background = "transparent"; }}
        >
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Logout
        </button>
      </div>
    </div>
  );
}
