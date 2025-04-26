<script setup lang="ts">
import { defineProps, defineEmits } from 'vue';

defineProps<{ currentPeriod: string }>();
const emit = defineEmits(['prev-week', 'next-week', 'go-to-today']); // Add 'go-to-today'
</script>

<template>
  <div class="calendar-header">
    <button @click="emit('prev-week')">&lt; Prev</button>
    <button @click="emit('go-to-today')" class="today-button">Today</button>
    <h2>{{ currentPeriod }}</h2>
    <button @click="emit('next-week')">Next &gt;</button>
  </div>
</template>

<style scoped>
.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.today-button {
  margin: 0 0.5rem; /* Add margin to the today button for spacing */
}

.calendar-header h2 {
  margin: 0;
}
</style>
