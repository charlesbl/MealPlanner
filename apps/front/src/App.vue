<script setup lang="ts">
import { computed } from "vue";
import BottomNav from "./components/ui/BottomNav.vue";
import { useDarkMode } from "./composables/useDarkMode";
import { useAuthStore } from "./stores/authStore";

useDarkMode();
const auth = useAuthStore();

const isAuthenticated = computed(() => !!auth.user || !!auth.token);
</script>

<template>
    <div id="app">
        <RouterView v-if="!isAuthenticated" />
        <template v-else>
            <main class="page-content">
                <RouterView />
            </main>
            <BottomNav />
        </template>
    </div>
</template>

<style scoped>
#app {
    height: 100dvh;
    display: flex;
    flex-direction: column;
}

.page-content {
    flex: 1;
    overflow-y: auto;
    padding-bottom: 72px;
}
</style>
