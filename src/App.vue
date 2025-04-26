<script setup lang="ts">
import CalendarView from './views/CalendarView.vue';
import ChatBot from './components/ChatBot.vue';
</script>

<template>
  <div class="app-container">
    <CalendarView class="calendar-view" />
    <ChatBot class="chat-bot" />
  </div>
</template>

<style scoped>
.app-container {
  display: flex;
  height: 100vh;
}

.calendar-view {
  flex: 1;
}

.chat-bot {
  flex: 0 0 300px;
}
</style>
