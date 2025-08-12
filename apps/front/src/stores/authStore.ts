import type { AuthUser } from "@mealplanner/shared-all";
import { defineStore } from "pinia";
import { ref } from "vue";
import {
    authLogin,
    authMe,
    authRegister,
    clearToken,
    getToken,
    saveToken,
} from "../services/authService";

export const useAuthStore = defineStore("auth", () => {
    const user = ref<AuthUser | null>(null);
    const token = ref<string | null>(getToken());
    const loading = ref(!!token.value);
    const error = ref<string | null>(null);

    async function init() {
        if (!token.value) {
            loading.value = false;
            return;
        }
        try {
            loading.value = true;
            user.value = await authMe(token.value);
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
            const res = await authLogin(email, password);
            token.value = res.token;
            user.value = res.user;
            saveToken(res.token);
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
            const res = await authRegister(name, email, password);
            token.value = res.token;
            user.value = res.user;
            saveToken(res.token);
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
        clearToken();
    }

    return { user, token, loading, error, init, login, register, logout };
});
