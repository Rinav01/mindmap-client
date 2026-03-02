import { api } from "./api";

import type { User } from "../types/user.ts";

export interface AuthResponse {
    token: string;
    user: User;
}

export const authService = {
    async register(data: Pick<User, "username" | "email" | "password">): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>("/auth/register", data);
        return response.data;
    },

    async login(data: Pick<User, "email" | "password">): Promise<AuthResponse> {
        const response = await api.post<AuthResponse>("/auth/login", data);
        return response.data;
    },

    async getProfile(): Promise<User> {
        const response = await api.get<User>("/auth/me");
        return response.data;
    },
};
