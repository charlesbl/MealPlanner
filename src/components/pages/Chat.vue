<script lang="ts" setup></script>

<template>
    <div class="chat-container">
        <div class="messages">
            <div v-for="value in 50">message {{ value }}</div>
        </div>
        <div class="input-area">
            <input type="text" placeholder="Type a message..." />
            <button>Send</button>
        </div>
    </div>
</template>

<style scoped>
.chat-container {
    background-color: green;
    height: 100%;
    display: flex;
    flex-direction: column;
}
.messages {
    overflow-y: auto;
}
.input-area {
    display: flex;
    justify-content: space-between;
}
</style>
