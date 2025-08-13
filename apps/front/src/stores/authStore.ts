import type { AuthUser } from "@mealplanner/shared-all";
import { defineStore } from "pinia";
import { ref } from "vue";
import { authService } from "../services/authService";

export const useAuthStore = defineStore("auth", () => {
    const user = ref<AuthUser | null>(null);
    const token = ref<string | null>(authService.getToken());
    const loading = ref(!!token.value);
    const error = ref<string | null>(null);

    async function init() {
        if (!token.value) {
            loading.value = false;
            return;
        }
        try {
            loading.value = true;
            user.value = await authService.authMe(token.value);
        } catch (e: any) {
            logout();
        } finally {
            loading.value = false;
        }
    }

    async function login(email: string, password: string) {
        loading.value = true;
        error.value = null;
        try {
            const res = await authService.authLogin(email, password);
            token.value = res.token;
            user.value = res.user;
            authService.saveToken(res.token);
        } catch (e: any) {
            error.value = e?.message || "Login failed";
            throw e;
        } finally {
            loading.value = false;
        }
    }

    async function register(name: string, email: string, password: string) {
        loading.value = true;
        error.value = null;
        try {
            const res = await authService.authRegister(name, email, password);
            token.value = res.token;
            user.value = res.user;
            authService.saveToken(res.token);
        } catch (e: any) {
            error.value = e?.message || "Register failed";
            throw e;
        } finally {
            loading.value = false;
        }
    }

    function logout() {
        token.value = null;
        user.value = null;
        authService.clearToken();
    }

    return { user, token, loading, error, init, login, register, logout };
});
