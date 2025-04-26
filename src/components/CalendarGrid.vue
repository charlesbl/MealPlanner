<script setup lang="ts">
import { defineProps } from 'vue';
import DayCell from './DayCell.vue';
import type { DayInfo } from '@/types/calendar.types'; // Import DayInfo

defineProps<{ 
  daysInView: DayInfo[];
}>();

const getDayName = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { weekday: 'short', timeZone: 'UTC' }); 
};
</script>

<template>
  <div class="calendar-grid">
    <div class="day-header" v-for="day in daysInView" :key="day.isoDate + '-header'">{{ getDayName(day.isoDate) }}</div>
    <DayCell 
      v-for="day in daysInView" 
      :key="day.isoDate" 
      :day="day" 
    />
  </div>
</template>

<style scoped>
.calendar-grid {
  display: grid;
  grid-template-columns: repeat(7, 1fr); /* 7 equal columns */
  grid-template-rows: auto 1fr; /* Header row auto, Day cells take remaining space */
  gap: 5px;
  flex-grow: 1; /* Allow grid to take remaining space */
  border: 1px solid #ccc;
}

.day-header {
  text-align: center;
  font-weight: bold;
  padding: 0.5rem;
  background-color: #f0f0f0;
  border-bottom: 1px solid #ccc;
}
</style>
