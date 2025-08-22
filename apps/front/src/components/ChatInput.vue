<script lang="ts" setup>
import { ref } from "vue";

interface Props {
    disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
    disabled: false,
});

const message = ref("");

const emit = defineEmits<{
    sendMessage: [message: string];
}>();

const sendMessage = () => {
    if (props.disabled || !message.value.trim()) return;

    emit("sendMessage", message.value.trim());
    message.value = "";
};

const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        sendMessage();
    }
};
</script>

<template>
    <div class="input-area-wrapper">
        <div class="input-area">
            <input
                v-model="message"
                type="text"
                placeholder="Type a message..."
                :disabled="disabled"
                @keydown="handleKeydown"
            />
            <button
                :disabled="disabled || !message.trim()"
                @click="sendMessage"
            >
                Send
            </button>
        </div>
    </div>
</template>

<style scoped>
.input-area-wrapper {
    width: 100%;
}
.input-area {
    display: flex;
    gap: 8px;
    padding: 8px;
}

.input-area-wrapper input {
    flex: 1;
    padding: 12px 16px;
    border: 1px solid var(--border-dark);
    border-radius: 24px;
    font-size: 16px;
    outline: none;
    transition: border-color 0.2s ease;
    background-color: var(--bg-primary);
    color: var(--text-primary);
}

.input-area-wrapper input::placeholder {
    color: var(--text-placeholder);
}

.input-area-wrapper input:focus {
    border-color: var(--accent-blue);
    box-shadow: 0 0 0 2px rgba(77, 171, 247, 0.25);
}

.input-area-wrapper input:disabled {
    background-color: var(--bg-accent);
    color: var(--text-muted);
    cursor: not-allowed;
    opacity: 0.6;
}

.input-area-wrapper button {
    padding: 12px 20px;
    background-color: var(--accent-blue);
    color: var(--bg-primary);
    border: none;
    border-radius: 24px;
    font-size: 16px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    min-width: 60px;
}

.input-area-wrapper button:hover:not(:disabled) {
    background-color: var(--accent-blue-hover);
}

.input-area-wrapper button:active:not(:disabled) {
    transform: scale(0.98);
}

.input-area-wrapper button:disabled {
    background-color: var(--text-muted);
    cursor: not-allowed;
    opacity: 0.6;
}
</style>
