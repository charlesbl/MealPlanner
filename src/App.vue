<script setup lang="ts">
import ChatBot from "./components/ChatBot.vue";
import MealListView from "./views/MealListView.vue";
</script>

<template>
    <div class="app-container">
        <MealListView class="meal-view" />
        <ChatBot class="chat-bot" />
    </div>
</template>

<style scoped>
.app-container {
    display: flex;
    height: 100vh;
}

.meal-view {
    flex: 1;
}

.chat-bot {
    flex: 0 0 500px;
}
</style>
