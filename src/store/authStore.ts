import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/user.ts";
import { authService } from "../services/authService.ts";

interface AuthState {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (token: string, user: User) => void;
    logout: () => void;
    checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set, get) => ({
            user: null,
            token: null,
            isAuthenticated: false,
            isLoading: true, // Start loading on initialization

            login: (token: string, user: User) => {
                set({ user, token, isAuthenticated: true });
            },

            logout: () => {
                set({ user: null, token: null, isAuthenticated: false });
            },

            checkAuth: async () => {
                const { token } = get();
                if (!token) {
                    set({ isLoading: false, isAuthenticated: false });
                    return;
                }

                try {
                    // Attempt to fetch user profile with existing token
                    set({ isLoading: true });
                    const user = await authService.getProfile();
                    set({ user, isAuthenticated: true, isLoading: false });
                } catch (error) {
                    // Token is invalid or expired
                    console.error("Auth check failed:", error);
                    set({ user: null, token: null, isAuthenticated: false, isLoading: false });
                }
            },
        }),
        {
            name: "auth-storage", // name of the item in the storage (must be unique)
            partialize: (state) => ({ token: state.token }), // Only persist the token
        }
    )
);
