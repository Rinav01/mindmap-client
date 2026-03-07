import { useAuthStore } from "../store/authStore";

/**
 * Returns the current user's display name and colour for socket payloads.
 * Falls back to "Anonymous" / blue if no user is logged in.
 */
export function getCurrentUserInfo(): { name: string; color: string } {
    const user = useAuthStore.getState().user;
    return {
        name: user?.username || user?.name || "Anonymous",
        color: user?.color || "#3b82f6",
    };
}
