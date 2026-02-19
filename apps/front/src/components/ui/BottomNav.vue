<template>
    <nav
        class="fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex items-center justify-around px-2 h-14 z-50"
    >
        <button
            v-for="item in items"
            :key="item.page"
            @click="$emit('navigate', item.page)"
            class="flex flex-col items-center justify-center gap-0.5 flex-1 h-full cursor-pointer bg-transparent border-0 relative"
        >
            <component
                :is="item.icon"
                :size="20"
                :class="activePage === item.page ? 'text-accent' : 'text-muted'"
                :stroke-width="1.5"
            />
            <span
                v-if="activePage === item.page"
                class="absolute bottom-1.5 w-1 h-1 rounded-full bg-accent"
            />
        </button>
    </nav>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import {
    Home,
    MessageCircle,
    BookOpen,
    BookMarked,
    User,
} from "lucide-vue-next";

type Page = "home" | "chat" | "library" | "journal" | "profile";

defineProps<{
    activePage: Page;
}>();

defineEmits<{
    navigate: [page: Page];
}>();

const items: { page: Page; icon: Component }[] = [
    { page: "home", icon: Home },
    { page: "library", icon: BookOpen },
    { page: "chat", icon: MessageCircle },
    { page: "journal", icon: BookMarked },
    { page: "profile", icon: User },
];
</script>
