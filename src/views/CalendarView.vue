<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import CalendarHeader from '@/components/CalendarHeader.vue';
import CalendarGrid from '@/components/CalendarGrid.vue';
import type { DayInfo } from '@/types/calendar.types';

const LOCAL_STORAGE_KEY = 'calendarCurrentStartDate';

// --- Date Logic (Remains in the parent view) ---
const today = new Date();
today.setHours(0, 0, 0, 0);
const todayISO = today.toISOString().split('T')[0];

const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat
  const diff = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust to Monday
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

// Load initial date from local storage or default to today's week
const initialDateString = localStorage.getItem(LOCAL_STORAGE_KEY);
const initialDate = initialDateString ? new Date(initialDateString) : new Date();
const currentStartDate = ref(getStartOfWeek(initialDate));

// Watch for changes in currentStartDate and save to local storage
watch(currentStartDate, (newDate) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, newDate.toISOString());
});

const currentPeriod = computed(() => {
  const start = currentStartDate.value;
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const startMonth = start.toLocaleString('default', { month: 'short' });
  const endMonth = end.toLocaleString('default', { month: 'short' });
  const startDay = start.getDate();
  const endDay = end.getDate();
  const year = start.getFullYear();

  if (startMonth === endMonth) {
    return `${startMonth} ${startDay} - ${endDay}, ${year}`;
  } else {
    return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
  }
});

const daysInView = computed(() => {
  const days: DayInfo[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(currentStartDate.value);
    date.setDate(date.getDate() + i);
    date.setHours(0, 0, 0, 0);
    const isoDate = date.toISOString().split('T')[0];
    days.push({
      isoDate,
      dayOfMonth: date.getDate(),
      isCurrentDay: isoDate === todayISO
    });
  }
  return days;
});

function prevWeek() {
  currentStartDate.value.setDate(currentStartDate.value.getDate() - 7);
  currentStartDate.value = new Date(currentStartDate.value); // Trigger reactivity
}

function nextWeek() {
  currentStartDate.value.setDate(currentStartDate.value.getDate() + 7);
  currentStartDate.value = new Date(currentStartDate.value); // Trigger reactivity
}

// Add function to handle going to today's week
function goToToday() {
  currentStartDate.value = getStartOfWeek(new Date());
}

</script>
<template>
  <div class="calendar-view">
    <CalendarHeader 
      :currentPeriod="currentPeriod" 
      @prev-week="prevWeek" 
      @next-week="nextWeek" 
      @go-to-today="goToToday" 
    />
    <CalendarGrid 
      :daysInView="daysInView" 
    />
  </div>
</template>

<style scoped>
.calendar-view {
  display: flex;
  flex-direction: column;
  height: 100vh; /* Make view take full viewport height */
  padding: 1rem;
  box-sizing: border-box;
  max-width: 1400px; /* Limit maximum width */
  width: 100%; /* Ensure it takes available width up to max-width */
  margin: 0 auto; /* Center the calendar horizontally */
}

/* Styles specific to the overall view layout remain here */
/* Styles related to header, grid, day cells, and meal slots are moved to their respective components */
</style>
