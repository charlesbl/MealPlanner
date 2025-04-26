<script setup lang="ts">
import { defineProps } from 'vue';
import MealSlotDisplay from './MealSlotDisplay.vue';
import { MealSlot } from '@/stores/mealStore';
import type { DayInfo } from '@/types/calendar.types'; // Import DayInfo

const mealSlots = Object.values(MealSlot);
defineProps<{ 
  day: DayInfo;
}>();
</script>

<template>
  <div class="day-cell" :class="{ 'current-day': day.isCurrentDay }">
    <span class="day-number">{{ day.dayOfMonth }}</span>
    <div class="meal-slots">
      <MealSlotDisplay 
        v-for="slot in mealSlots" 
        :key="slot" 
        :date="day.isoDate" 
        :slot="slot" 
      />
    </div>
  </div>
</template>

<style scoped>
.day-cell {
  border: 1px solid #eee;
  padding: 0.5rem;
  min-height: 150px; /* Increased height for slots */
  display: flex;
  flex-direction: column;
  position: relative; /* For potential absolute positioning later */
}

.day-number {
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-align: right;
}

.current-day {
  background-color: #eaf6ff; /* Light blue highlight */
}

.current-day .day-number {
  color: #007bff;
  font-weight: bolder;
}

.meal-slots {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 4px; /* Space between slots */
}
</style>
