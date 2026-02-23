<script setup lang="ts">
import type { ThreadSummary } from "@mealplanner/shared-all";

defineProps<{
    threads: ThreadSummary[];
    currentThreadId: string;
    isOpen: boolean;
}>();

const emit = defineEmits<{
    select: [id: string];
    delete: [id: string];
    new: [];
    close: [];
}>();

function formatRelativeDate(date: Date | string): string {
    const d = typeof date === "string" ? new Date(date) : date;
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffH = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMin < 1) return "à l'instant";
    if (diffMin < 60) return `il y a ${diffMin}min`;
    if (diffH < 24) return `il y a ${diffH}h`;
    if (diffDays === 1) return "hier";
    if (diffDays < 7) {
        return d.toLocaleDateString("fr-FR", {
            weekday: "short",
            day: "numeric",
            month: "short",
        });
    }
    return d.toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
    });
}
</script>

<template>
    <!-- Backdrop -->
    <div v-if="isOpen" class="drawer-backdrop" @click="emit('close')" />

    <!-- Drawer panel -->
    <div class="drawer" :class="{ 'drawer-open': isOpen }">
        <!-- Header -->
        <div class="drawer-header">
            <span class="drawer-title">CONVERSATIONS</span>
            <button class="close-btn" @click="emit('close')">✕</button>
        </div>

        <!-- New conversation -->
        <button class="new-btn" @click="emit('new')">
            + Nouvelle conversation
        </button>

        <!-- Thread list -->
        <div class="thread-list">
            <div
                v-for="thread in threads"
                :key="thread.id"
                class="thread-item"
                :class="{ 'thread-active': thread.id === currentThreadId }"
                @click="emit('select', thread.id)"
            >
                <div class="thread-info">
                    <p class="thread-title">{{ thread.title }}</p>
                    <p class="thread-date">
                        {{ formatRelativeDate(thread.lastMessageAt) }}
                    </p>
                </div>
                <button
                    class="delete-btn"
                    @click.stop="emit('delete', thread.id)"
                    title="Supprimer"
                >
                    ✕
                </button>
            </div>

            <p v-if="threads.length === 0" class="no-threads">
                Aucune conversation
            </p>
        </div>
    </div>
</template>

<style scoped>
.drawer-backdrop {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 150;
}

.drawer {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    width: 280px;
    background: #0d0f14;
    border-right: 1px solid var(--color-border);
    z-index: 160;
    display: flex;
    flex-direction: column;
    transform: translateX(-100%);
    transition: transform 0.3s ease;
}

.drawer-open {
    transform: translateX(0);
}

.drawer-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 16px 12px;
    border-bottom: 1px solid var(--color-border);
    flex-shrink: 0;
}

.drawer-title {
    font-size: 11px;
    color: var(--color-muted);
    letter-spacing: 0.1em;
    font-weight: 500;
}

.close-btn {
    background: none;
    border: none;
    color: var(--color-muted);
    font-size: 14px;
    cursor: pointer;
    padding: 2px 4px;
    opacity: 0.7;
    transition: opacity 0.15s;
}

.close-btn:hover {
    opacity: 1;
}

/* New conversation button */
.new-btn {
    margin: 12px 12px 0;
    padding: 10px 12px;
    background: none;
    border: 1px solid var(--color-accent);
    border-radius: 4px;
    color: var(--color-accent);
    font-size: 13px;
    cursor: pointer;
    text-align: left;
    transition: opacity 0.15s;
    flex-shrink: 0;
}

.new-btn:hover {
    opacity: 0.8;
}

/* Thread list */
.thread-list {
    flex: 1;
    overflow-y: auto;
    padding: 8px 0;
}

.thread-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 16px;
    cursor: pointer;
    border-left: 2px solid transparent;
    transition: background 0.15s;
}

.thread-item:hover {
    background: rgba(255, 255, 255, 0.04);
}

.thread-active {
    border-left-color: var(--color-accent);
    background: rgba(255, 255, 255, 0.04);
}

.thread-info {
    flex: 1;
    min-width: 0;
}

.thread-title {
    font-size: 13px;
    color: var(--color-text);
    margin: 0;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    line-height: 1.3;
}

.thread-date {
    font-size: 11px;
    color: var(--color-muted);
    margin: 2px 0 0;
    line-height: 1;
}

.delete-btn {
    background: none;
    border: none;
    color: var(--color-muted);
    font-size: 11px;
    cursor: pointer;
    padding: 2px 4px;
    opacity: 0;
    transition: opacity 0.15s;
    flex-shrink: 0;
}

.thread-item:hover .delete-btn {
    opacity: 0.6;
}

.delete-btn:hover {
    opacity: 1 !important;
    color: #f87171;
}

.no-threads {
    font-size: 13px;
    color: var(--color-muted);
    text-align: center;
    padding: 24px;
    margin: 0;
}
</style>
