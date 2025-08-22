<script setup lang="ts">
import { computed, ref, watch } from "vue";
import Chat from "./components/pages/Chat.vue";
import Library from "./components/pages/Library.vue";
import Login from "./components/pages/Login.vue";
import Plan from "./components/pages/Plan.vue";
import Register from "./components/pages/Register.vue";
import { useDarkMode } from "./composables/useDarkMode";
import { useAuthStore } from "./stores/authStore";

useDarkMode();
const auth = useAuthStore();

// Optimistic auth: if a token exists, we consider the user authenticated for UI gating
const isAuthenticated = computed(() => !!auth.user || !!auth.token);
const showRegister = ref(false);
const appContainer = ref<HTMLElement>();
const positioned = ref(false);

// Position pages once authenticated and container exists
watch(
    [isAuthenticated, appContainer],
    () => {
        if (!positioned.value && isAuthenticated.value && appContainer.value) {
            // initial snap to Chat page without animation
            appContainer.value.scrollLeft = window.innerWidth;
            requestAnimationFrame(() => {
                if (appContainer.value) {
                    appContainer.value.style.scrollBehavior = "smooth";
                    appContainer.value.classList.add("loaded");
                    positioned.value = true;
                }
            });
        }
    },
    { immediate: true }
);

// Reset positioned flag on logout
watch(
    () => isAuthenticated.value,
    (now, prev) => {
        if (!now && prev) positioned.value = false;
    }
);
</script>

<template>
    <div v-if="isAuthenticated" ref="appContainer" class="app-container">
        <div class="page"><Library /></div>
        <div class="page"><Chat /></div>
        <div class="page"><Plan /></div>
    </div>
    <div v-else class="auth-container">
        <Login v-if="!showRegister" @go-register="showRegister = true" />
        <Register v-else @go-login="showRegister = false" />
    </div>
</template>

<style scoped>
.app-container {
    display: grid;
    grid-template-columns: repeat(3, 100vw);
    height: 100dvh;
    overflow: hidden;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: auto; /* Will be set to smooth after initial positioning */
    -webkit-overflow-scrolling: touch;
    overscroll-behavior-x: contain;
    background-color: var(--bg-secondary);
    opacity: 0; /* Hide initially to prevent flash */
    transition: opacity 0.1s ease-in;
}

.app-container.loaded {
    opacity: 1;
}

.page {
    scroll-snap-align: start;
    scroll-snap-stop: always;
    overflow-y: auto;
    overflow: hidden;
}

.auth-container {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100dvh;
    background: var(--bg-secondary);
}
</style>
