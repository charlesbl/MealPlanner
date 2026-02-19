import {
    profileService,
    type UpdateProfileRequest,
    type UserProfile,
} from "@mealplanner/shared-all";
import { defineStore } from "pinia";
import { ref, watch } from "vue";
import { useAuthStore } from "./authStore";

export const useProfileStore = defineStore("profileStore", () => {
    const profile = ref<UserProfile | null>(null);
    const tdee = ref<number | null>(null);
    const loading = ref(false);
    const error = ref<string | null>(null);
    const auth = useAuthStore();

    async function fetchProfile() {
        if (!auth.token || loading.value) return;
        loading.value = true;
        error.value = null;
        try {
            const res = await profileService.fetchProfile(auth.token);
            profile.value = res.profile;
            tdee.value = res.tdee;
        } catch (e: any) {
            error.value = e.message ?? "Failed to fetch profile";
        } finally {
            loading.value = false;
        }
    }

    async function saveProfile(patch: UpdateProfileRequest) {
        if (!auth.token) return;
        loading.value = true;
        error.value = null;
        try {
            const res = await profileService.updateProfile(patch, auth.token);
            profile.value = res.profile;
            tdee.value = res.tdee;
        } catch (e: any) {
            error.value = e.message ?? "Failed to update profile";
            throw e;
        } finally {
            loading.value = false;
        }
    }

    watch(
        () => auth.token,
        (token) => {
            if (token) void fetchProfile();
            else {
                profile.value = null;
                tdee.value = null;
            }
        },
        { immediate: true },
    );

    return { profile, tdee, loading, error, fetchProfile, saveProfile };
});
