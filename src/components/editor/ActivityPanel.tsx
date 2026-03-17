import { useEditorStore } from "../../store/editorStore";

// Helper to format timestamps relative to now
function formatTimeAgo(dateString: string) {
    const date = new Date(dateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "Just now";

    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return `Yesterday`;
    return `${diffDays}d ago`;
}

// Helper to formulate human-readable log messages
function getLogMessage(log: any) {
    const userName = log.userId?.username || "Someone";
    const Name = () => <span className="log-user">{userName}</span>;

    switch (log.action) {
        case "NODE_CREATED":
            return <div className="log-content"><Name /> <span className="log-action">created a new node</span></div>;
        case "AI_GENERATED":
            return <div className="log-content"><Name /> <span className="log-action">generated AI map for</span> <span className="log-pill">"{log.metadata?.text}"</span></div>;
        case "AI_EXPANDED":
            return <div className="log-content"><Name /> <span className="log-action">used AI to brainstorm</span> <span className="log-pill">"{log.metadata?.text}"</span></div>;
        case "NODE_DELETED":
            return <div className="log-content"><Name /> <span className="log-action">deleted a node</span> <span className="log-pill">"{log.metadata?.text || 'Unknown'}"</span></div>;
        case "NODE_EDITED":
            return <div className="log-content"><Name /> <span className="log-action">edited node text to</span> <span className="log-pill">"{log.metadata?.text}"</span></div>;
        case "NODE_MOVED":
            return <div className="log-content"><Name /> <span className="log-action">moved a node</span></div>;
        case "NODE_COLOR_CHANGED":
            if (log.metadata?.oldColor && log.metadata?.newColor) {
                return <div className="log-content"><Name /> <span className="log-action">changed color from</span>
                    <span className="color-swatch" style={{ background: log.metadata.oldColor }} /> <span className="log-action">to</span>
                    <span className="color-swatch" style={{ background: log.metadata.newColor }} />
                </div>;
            }
            return <div className="log-content"><Name /> <span className="log-action">changed a node's color</span></div>;
        default:
            return <div className="log-content"><Name /> <span className="log-action">performed an action</span></div>;
    }
}

interface ActivityPanelProps {
    onClose: () => void;
}

export default function ActivityPanel({ onClose }: ActivityPanelProps) {
    const activityLogs = useEditorStore((s) => s.activityLogs);

    return (
        <div className="activity-panel dark">
            <style>{`
                .activity-panel {
                    position: fixed;
                    top: 0;
                    right: 0;
                    height: 100%;
                    width: 320px;
                    background-color: rgba(16, 28, 34, 0.85);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    border-left: 1px solid rgba(255,255,255,0.08);
                    z-index: 1000;
                    display: flex;
                    flex-direction: column;
                    box-shadow: -8px 0 24px rgba(0,0,0,0.6);
                    font-family: 'Inter', sans-serif;
                    animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                    color: #f1f5f9;
                }
                @keyframes slideIn {
                    from { transform: translateX(100%); }
                    to { transform: translateX(0); }
                }

                .ap-header {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    padding: 24px 16px 16px 16px;
                    border-bottom: 1px solid rgba(255,255,255,0.08);
                    background: linear-gradient(to bottom, rgba(255,255,255,0.02), transparent);
                }
                .ap-title-area {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }
                .ap-icon-wrapper {
                    display: flex;
                    height: 40px;
                    width: 40px;
                    align-items: center;
                    justify-content: center;
                    border-radius: 8px;
                    background: rgba(13, 166, 242, 0.2);
                    color: #0da6f2;
                }
                .ap-title {
                    margin: 0;
                    font-size: 1.125rem;
                    font-weight: 600;
                    letter-spacing: -0.025em;
                }
                .ap-close-btn {
                    display: flex;
                    height: 40px;
                    width: 40px;
                    align-items: center;
                    justify-content: center;
                    border-radius: 9999px;
                    background: transparent;
                    border: none;
                    color: #94a3b8;
                    cursor: pointer;
                    transition: all 0.2s;
                }
                .ap-close-btn:hover {
                    background: rgba(255,255,255,0.1);
                    color: #ffffff;
                }

                .ap-body {
                    flex: 1;
                    overflow-y: auto;
                    padding: 24px 16px;
                    position: relative;
                }
                .ap-body::-webkit-scrollbar {
                    width: 6px;
                }
                .ap-body::-webkit-scrollbar-track {
                    background: transparent;
                }
                .ap-body::-webkit-scrollbar-thumb {
                    background: rgba(255,255,255,0.1);
                    border-radius: 4px;
                }
                .ap-body::-webkit-scrollbar-thumb:hover {
                    background: rgba(255,255,255,0.2);
                }

                .ap-timeline-line {
                    position: absolute;
                    left: 35px; /* 16px padding + 20px half avatar */
                    top: 24px;
                    bottom: 24px;
                    width: 2px;
                    background: rgba(255,255,255,0.08);
                    z-index: 0;
                }

                .ap-item {
                    position: relative;
                    margin-bottom: 32px;
                    display: grid;
                    grid-template-columns: 40px 1fr;
                    gap: 12px;
                    z-index: 1;
                }
                
                .ap-avatar-wrapper {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    z-index: 10;
                }
                
                .ap-avatar {
                    display: flex;
                    height: 40px;
                    width: 40px;
                    align-items: center;
                    justify-content: center;
                    border-radius: 9999px;
                    font-weight: 700;
                    font-size: 0.875rem;
                    color: white;
                    border: 4px solid #101c22;
                    box-shadow: 0 0 0 1px rgba(255,255,255,0.1);
                }
                
                .ap-content-wrapper {
                    display: flex;
                    flex-direction: column;
                    padding-top: 4px;
                }

                .log-content {
                    display: flex;
                    flex-wrap: wrap;
                    align-items: center;
                    gap: 6px;
                    font-size: 0.875rem;
                    line-height: 1.625;
                }
                .log-user {
                    font-weight: 600;
                    color: #0da6f2;
                }
                .log-action {
                    color: #94a3b8;
                }
                .log-pill {
                    display: inline-flex;
                    align-items: center;
                    border-radius: 9999px;
                    background: rgba(255,255,255,0.08);
                    padding: 2px 10px;
                    font-size: 0.75rem;
                    font-weight: 500;
                    color: #cbd5e1;
                }
                .color-swatch {
                    width: 14px;
                    height: 14px;
                    border-radius: 50%;
                    border: 1px solid rgba(255,255,255,0.2);
                    display: inline-block;
                }

                .ap-timestamp {
                    margin-top: 6px;
                    font-size: 0.75rem;
                    color: #64748b;
                    font-weight: 500;
                }

                .ap-empty {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    justify-content: center;
                    height: 100%;
                    color: #64748b;
                    gap: 12px;
                    font-size: 0.875rem;
                }
            `}</style>

            {/* Header */}
            <div className="ap-header">
                <div className="ap-title-area">
                    <div className="ap-icon-wrapper">
                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25" />
                        </svg>
                    </div>
                    <h2 className="ap-title">Activity Log</h2>
                </div>
                <button className="ap-close-btn" onClick={onClose} title="Close">
                    <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* List */}
            <div className="ap-body">
                {activityLogs.length > 0 && <div className="ap-timeline-line" />}

                {activityLogs.length === 0 ? (
                    <div className="ap-empty">
                        <svg width="40" height="40" fill="none" stroke="currentColor" opacity="0.5" strokeWidth="1.5" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        No activity recorded yet
                    </div>
                ) : (
                    activityLogs.map((log) => (
                        <div key={log._id} className="ap-item">
                            <div className="ap-avatar-wrapper">
                                <div
                                    className="ap-avatar"
                                    style={{ background: log.userId?.color || "#3b82f6" }}
                                >
                                    {log.userId?.username ? log.userId.username.charAt(0).toUpperCase() : "?"}
                                </div>
                            </div>
                            <div className="ap-content-wrapper">
                                {getLogMessage(log)}
                                <div className="ap-timestamp">
                                    {formatTimeAgo(log.createdAt)}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

