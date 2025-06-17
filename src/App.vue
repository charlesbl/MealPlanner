<script setup lang="ts">
import ChatBot from "./components/ChatBot.vue";
import Widgets from "./components/Widgets.vue";
</script>

<template>
    <div class="app-container">
        <ChatBot class="chat-bot" />
        <Widgets></Widgets>
    </div>
</template>

<style scoped>
.app-container {
    display: flex;
    height: 100vh;
}

.chat-bot {
    width: 50vw;
}
</style>
