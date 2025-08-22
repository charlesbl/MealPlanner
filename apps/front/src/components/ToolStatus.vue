<script lang="ts" setup>
interface Props {
    name: string;
    status: "running" | "completed";
}

defineProps<Props>();
</script>

<template>
    <div class="tool-status" :class="status">
        <span class="icon">🔧</span>
        <span class="name">{{ name }}</span>
        <span class="spacer"></span>
        <span v-if="status === 'running'" class="running">
            <span class="spinner" aria-hidden="true"></span>
            <span class="label">Running…</span>
        </span>
        <span v-else class="completed">
            <span class="check">✅</span>
            <span class="label">Completed</span>
        </span>
    </div>
</template>

<style scoped>
.tool-status {
    display: flex;
    align-items: center;
    gap: 8px;
    border: 1px solid var(--border-medium);
    background: var(--bg-primary);
    color: var(--text-secondary);
    border-radius: 10px;
    padding: 8px 10px;
    font-size: 14px;
}

.tool-status .icon {
    opacity: 0.9;
}
.tool-status .name {
    color: var(--text-primary);
    font-weight: 500;
}
.tool-status .spacer {
    flex: 1;
}

.running .spinner {
    width: 14px;
    height: 14px;
    border: 2px solid var(--border-medium);
    border-top-color: var(--text-secondary);
    border-radius: 50%;
    display: inline-block;
    animation: spin 0.9s linear infinite;
    margin-right: 6px;
}

.completed .check {
    margin-right: 6px;
}

@keyframes spin {
    to {
        transform: rotate(360deg);
    }
}
</style>
