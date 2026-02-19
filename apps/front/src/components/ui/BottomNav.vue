<template>
    <nav
        class="fixed bottom-0 left-0 right-0 bg-surface border-t border-border flex items-center justify-around px-2 h-14 z-50"
        style="padding-bottom: env(safe-area-inset-bottom)"
    >
        <button
            v-for="item in items"
            :key="item.name"
            @click="router.push(item.route)"
            class="flex flex-col items-center justify-center gap-0.5 flex-1 h-full cursor-pointer bg-transparent border-0 relative"
        >
            <component
                :is="item.icon"
                :size="20"
                :class="isActive(item) ? 'text-accent' : 'text-muted'"
                :stroke-width="1.5"
            />
            <span
                v-if="isActive(item)"
                class="absolute bottom-1.5 w-1 h-1 rounded-full bg-accent"
            />
        </button>
    </nav>
</template>

<script setup lang="ts">
import type { Component } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
    LayoutDashboard,
    MessageCircle,
    BookOpen,
    CalendarDays,
    User,
} from "lucide-vue-next";

type NavItem = {
    name: string;
    route: string;
    icon: Component;
};

const route = useRoute();
const router = useRouter();

const items: NavItem[] = [
    { name: "dashboard", route: "/dashboard", icon: LayoutDashboard },
    { name: "chat", route: "/chat", icon: MessageCircle },
    { name: "library", route: "/library", icon: BookOpen },
    { name: "journal", route: "/journal", icon: CalendarDays },
    { name: "profile", route: "/profile", icon: User },
];

function isActive(item: NavItem): boolean {
    return typeof route.name === "string" && route.name.startsWith(item.name);
}
</script>
