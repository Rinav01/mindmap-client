interface TopBarProps {
  onNewMap?: () => void;
}

export default function TopBar({ onNewMap }: TopBarProps) {
  return (
    <div style={{
      display: "flex", alignItems: "center", gap: "16px",
      padding: "0 0 24px 0",
    }}>
      {/* Search */}
      <div style={{ flex: 1, position: "relative", maxWidth: "480px" }}>
        <span style={{
          position: "absolute", left: "14px", top: "50%", transform: "translateY(-50%)",
          color: "#6b7280", pointerEvents: "none",
        }}>
          <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </span>
        <input
          placeholder="Search your maps..."
          style={{
            width: "100%", padding: "10px 14px 10px 40px",
            background: "#1f2937", border: "1px solid #374151",
            borderRadius: "10px", color: "white", fontSize: "14px",
            outline: "none", fontFamily: "Inter, sans-serif",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = "#3b82f6"; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = "#374151"; }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: "12px", marginLeft: "auto" }}>
        {/* Bell */}
        <button style={{
          background: "none", border: "none", cursor: "pointer",
          color: "#9ca3af", padding: "6px", borderRadius: "8px",
          display: "flex", alignItems: "center",
        }}>
          <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
        </button>

        {/* New Mind Map */}
        <button
          onClick={onNewMap}
          style={{
            display: "flex", alignItems: "center", gap: "6px",
            padding: "9px 16px", borderRadius: "10px",
            background: "#2563eb", border: "none", cursor: "pointer",
            color: "white", fontSize: "14px", fontWeight: 600,
            fontFamily: "Inter, sans-serif", whiteSpace: "nowrap",
            transition: "background 0.15s",
          }}
          onMouseEnter={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#1d4ed8"; }}
          onMouseLeave={(e) => { (e.currentTarget as HTMLButtonElement).style.background = "#2563eb"; }}
        >
          <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          New Mind Map
        </button>
      </div>
    </div>
  );
}
